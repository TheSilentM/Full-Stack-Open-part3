const notesRouter = require('express').Router()
const morgan = require('morgan')
const Person = require('../models/person')

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

notesRouter.use(morgan(':method :url :res[content-length] - :response-time ms - :body'))

notesRouter.get('/', (request, response) => {

  Person.find({}).then(people => {
    response.json(people)
  })
})

const date = new Date()

notesRouter.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info only for ${Person.length} people<p>
      <br/>
      <p>${date}</p>
    `
  )
})

notesRouter.get('/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id).then(result => {
    if(result) {
      response.json(result)
    } else {
      response.status(404).send('<h1>404 Page not found</h1>')
      response.end()
    }
  }).catch(error => next(error))
})

notesRouter.post('/', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Name or number is missing' })
  }

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => {
    next(error)
  })
})

notesRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id).then(() => {
    return response.status(204).end()
  }).catch(error => next(error))
})


notesRouter.put('/:id', (request, response, next) => {
  const { name, number } = request.body


  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(
      updatedPerson => {
        if(updatedPerson) {
          response.json(updatedPerson)
        } else {
          return response.status(404).end()
        }
      })
    .catch(error => next(error))
})

module.exports = notesRouter

