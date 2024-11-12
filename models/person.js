const mongoose = require('mongoose')

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true,
    trim: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true,
    trim: true,
    validate: {
      validator: (newNumber) => newNumber[2] === '-' || newNumber[3] === '-',
      message: props => `${props.value} is not a valid phone number!`
    },
  },
})

phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', phonebookSchema)


