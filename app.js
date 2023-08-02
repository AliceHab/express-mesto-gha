const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');

const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

const app = express();

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } =
  process.env;

app.use(bodyParser.json());

const helmet = require('helmet');

mongoose.connect(DB_URL, {});

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  createUser
);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  login
);

app.use(auth);

// Пользователь
app.use(helmet());
app.use(require('./routes/users'));

// Карточки
app.use(helmet());
app.use(require('./routes/cards'));
// Обработка несуществующих страниц
app.use('*', (req, res) =>
  res.status(404).send({ message: 'Страница не найдена' })
);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    message: statusCode === 500 ? 'Произошла ошибка' : message,
  });
});

app.listen(PORT, () => {});
