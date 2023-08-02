const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-req-err');
const UnauthorizedError = require('../errors/unauthorized-err');

// const checkCard = (err, res) => {
//   if (err.kind === 'ObjectId') {
//     return res
//       .status(404)
//       .send({ message: 'Карточка с указанным _id не найдена' });
//   }
// };

const checkOwner = (cardId, userId) => {
  Card.findById(cardId).then((card) => {
    if (!card.owner === userId) {
      throw new UnauthorizedError('Ошибка аутентификации');
    }
  });
};

const checkDate = (err, res, errorText) => {
  if (err.name === 'ValidationError') {
    throw new BadRequestError('Ошибка в данных');
  }
};

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const owner = req.user._id;

  checkOwner(req.params.cardId, owner);

  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        throw new BadRequestError('Ошибка в данных');
      }
      next(err);
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      checkDate(err, res, 'Переданы некорректные данные при создании карточки');
      next(err);
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  // eslint-disable-next-line implicit-arrow-linebreak
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true, runValidators: true }
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        throw new BadRequestError('Ошибка в данных');
      }
      next(err);
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  // eslint-disable-next-line implicit-arrow-linebreak
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true, runValidators: true }
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        throw new BadRequestError('Ошибка в данных');
      }
      next(err);
    })
    .catch(next);
};
