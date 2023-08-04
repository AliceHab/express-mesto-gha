const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Поле "name" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
  },
  link: {
    type: String,
    required: [true, 'Поле "link" должно быть заполнено'],
    validate: {
      validator(v) {
        return validator.isURL(v);
      },
      message: (props) => `${props.value} неверный формат ссылки`,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Поле "owner" должно быть заполнено'],
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
