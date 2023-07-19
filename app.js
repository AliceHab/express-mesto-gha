const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();

app.use(bodyParser.json());

const helmet = require('helmet');

mongoose.connect(DB_URL, {});

// Временный мидлвэр для авторизаци
const temporaryId = (req, res, next) => {
  req.user = {
    _id: '64b2f912d199a298c947acd1',
  };

  next();
};

// Пользователь
app.use(helmet());
app.use(temporaryId);
app.use(require('./routes/users'));

// Карточки
app.use(helmet());
app.use(temporaryId);
app.use(require('./routes/cards'));
// Обрабтка несуществующих страниц
app.use('*', (req, res) => res.status(404).send({ message: 'Страница не найдена' }));

app.listen(PORT, () => {});
