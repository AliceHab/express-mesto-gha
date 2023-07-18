const Card = require('../models/card');

const checkCard = (err, res) => {
  if (err.kind === 'ObjectId') {
    return res
      .status(404)
      .send({ message: 'Карточка с указанным _id не найдена' });
  }
};

const checkDate = (err, res, errorText) => {
  if (err.name === 'ValidationError') {
    return res.status(400).send({
      message: errorText,
    });
  }
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      checkCard(err, res);
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      checkDate(err, res, 'Переданы некорректные данные при создании карточки');
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.likeCard = (req, res) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      checkCard(err, res);
      checkDate(err, res, 'Переданы некорректные данные для постановки лайка');
      res.status(500).send({ message: 'Произошла ошибка' });
    });

module.exports.dislikeCard = (req, res) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true, runValidators: true },
  )
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return res
          .status(404)
          .send({ message: 'Карточка с указанным _id не найдена' });
      }
      checkDate(err, res, 'Переданы некорректные данные для снятия лайка');
      res.status(500).send({ message: 'Произошла ошибка' });
    });
