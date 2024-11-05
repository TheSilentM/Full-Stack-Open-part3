const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
require("dotenv").config();
const Person = require("./models/people"); 


app.use(express.static("dist"));

const requestLogger = (request, response, next) => {
  console.log("Method: ", request.method);
  console.log("Path: ", request.path);
  console.log("Body: ", request.body);
  console.log("---");
  next();
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if(error.name === "CastError") {
    return response.status(400).send({ error: "ID not correct"})
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  
  next(error);
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);

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
    response.send(`<p>Phonebook has info only for ${people.length} people<p>
        <br/>
        <p>${date}</p>
        `
    );
})

app.post("/api/people", (request, response, next) => {
  const body = request.body;

  const person = new Person ({
    name: body.name,
    number: body.number
  })

  if (!body.name || !body.number) {
    return response.status(400).json({error: "Name or number is missing"})
  }

  person.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(error => {
    next(error.message)
  })
});

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


app.put("/api/people/:id", (request, response, next) => {
  const {name, number} = request.body;


  Person.findByIdAndUpdate(request.params.id, {name, number}, { new: true, runValidators: true, context: 'query' })
  .then(
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

