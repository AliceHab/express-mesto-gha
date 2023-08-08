const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const NotFoundError = require('./errors/not-found-err');

const { createUser, login } = require('./controllers/users');
const linkRegExp = require('./utils/regexp');

const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(bodyParser.json());

app.use(limiter);

mongoose.connect(DB_URL, {});

// логгер запросов
app.use(requestLogger);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(linkRegExp),
    }),
  }),
  createUser,
);
app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

// Пользователь
app.use(helmet());
app.use(auth);
app.use(require('./routes/users'));

// Карточки
app.use(helmet());
app.use(auth);
app.use(require('./routes/cards'));

// eslint-disable-next-line no-unused-vars
app.use('*', (req, res) => {
  throw new NotFoundError('Страница не найдена');
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {});
