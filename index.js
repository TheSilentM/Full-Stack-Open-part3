const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.use(express.static("dist"));

let people = [
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

morgan.token("body", req => {
  return JSON.stringify(req.body);
});

app.use(morgan(':method :url :res[content-length] - :response-time ms - :body'));

app.get("/", (request, response) => {
  response.json(people);
})

const date = new Date();

app.get("/info", (request, response) => {
    response.send(`<p>Phonebook has info only for 4 people<p>
        <br/>
        <p>${date}</p>
        `
    );
})

app.get("/api/people/:id", (request, response) => {
    const id = request.params.id;
    const personId = people.find(person => person.id === id);

    if (personId) {
        response.json(personId);
    } else {
        response.status(404).send("<h1>404 Page not found</h1>");
        response.end();
    }
});

app.delete("/api/people/:id", (request, response) => {
  const id = request.params.id;
  const deleteId = people.filter(person => person.id !== id);

  if (deleteId) {
    response.json(deleteId);
  } else {
    response.status(204).end();
  }
})

const generateId = () => {
  const minId = Math.max(...people.map(n => Number(n.id))); 
  const newId = Math.floor(Math.random() * (10 - minId + 1)) + minId;

  if (people.length > 0) {
    return String(newId);
  } else {
    return String(0);
  }
}

app.post("/api/people", (request, response) => {
  //TODO: generate a new ID with Math.random and add a new person on the phonebook
  const body = request.body;

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  if(!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number is missing"
    });
  } else if (people.find(person => person.name === body.name)) {
    return response.status(409).json({
      error: "name must be unique"
    })
  }

  people = people.concat(person);

  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on the port ${PORT}`);
});

