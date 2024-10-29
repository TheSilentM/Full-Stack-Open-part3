const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
//const mongoose = require("mongoose");
require("dotenv").config();
const Person = require("./models/people"); 


app.use(express.json());
app.use(cors());

app.use(express.static("dist"));


/*let people = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
  ];
*/
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

morgan.token("body", req => {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :res[content-length] - :response-time ms - :body'));

app.get("/api/people", (request, response) => {

  Person.find({}).then(people => {
      response.json(people);
    });
})

const date = new Date();

app.get("/info", (request, response) => {
    response.send(`<p>Phonebook has info only for 4 people<p>
        <br/>
        <p>${date}</p>
        `
    );
})

app.get("/api/people/:id", (request, response, next) => {
    const id = request.params.id;
    Person.findById(id).then(result => {
      if(result) {
        response.json(result);
      } else {
        response.status(404).send("<h1>404 Page not found</h1>");
        response.end();
      }
    }).catch(error => next(error))
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if(error.name === "CastError") {
    return response.status(400).send({ error: "ID not correct"})
  }
  
  next(error);
};

app.delete("/api/people/:id", (request, response, next) => {
  const id = request.params.id;

  Person.findByIdAndDelete(id).then(result => {
    return response.status(204).end();
  }).catch(error => next(error));
})

/*const generateId = () => {
  const minId = Math.max(...people.map(n => Number(n.id))); 
  const newId = Math.floor(Math.random() * (10 - minId + 1)) + minId;

  if (people.length > 0) {
    return String(newId);
  } else {
    return String(0);
  }
}*/


app.post("/api/people", (request, response) => {
  const body = request.body;

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({error: "Name or number is missing"})
  }

  const person = new Person ({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson);
  })
});

app.put("/api/people/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true }).then(
    updatedPerson => {
      if(updatedPerson) {
        response.json(updatedPerson);
      } else {
        return response.status(404).end();
      }
    })
    .catch(error => next(error))
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on the port ${PORT}`);
});

