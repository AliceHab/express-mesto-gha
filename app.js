const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {});

// Временный мидлвэр для авторизаци
const temporaryId = (req, res, next) => {
  req.user = {
    _id: '64b2f912d199a298c947acd1',
  };

  next();
};

// Пользователь
app.use(temporaryId);
app.use(require('./routes/users'));

// Карточки
app.use(temporaryId);
app.use(require('./routes/cards'));
// Обрабтка несуществующих страниц
app.use('*', (req, res) => res.status(404).send({ message: 'Страница не найдена' }));

app.listen(PORT, () => {});
