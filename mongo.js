const mongoose = require('mongoose')


if (process.argv.length < 3) {
  console.log('give password as arguments')
  process.exit(1)
}


const newName = process.argv[3]

const newNumber = process.argv[4]

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = new mongoose.model('Person', phonebookSchema)

const person = new Person({
  name: `${newName}`,
  number: `${newNumber}`
})


if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(p => {
      console.log(p)
    })
    mongoose.connection.close()
  })
} else {
  person.save().then(result => {
    console.log(`added ${newName}, number ${newNumber} to phonebook`)
    mongoose.connection.close()
  })
}


