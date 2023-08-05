const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-req-err');
const ForbiddenError = require('../errors/forbidden-err');

// eslint-disable-next-line no-unused-vars
const checkDate = (err, res, errorText) => {
  if (err.name === 'ValidationError') {
    throw new BadRequestError('Ошибка в данных');
  }
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  const user = req.user._id;

  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      } else if (!(card.owner.toString() === user)) {
        throw new ForbiddenError('Ошибка аутентификации');
      } else {
        Card.findByIdAndRemove(req.params.cardId)
          .then((deletedCard) => {
            res.send({ data: deletedCard });
          })
          .catch((err) => {
            if (err.kind === 'ObjectId') {
              throw new BadRequestError('Ошибка в данных');
            }
            next(err);
          });
      }
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
    { new: true, runValidators: true },
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
    { new: true, runValidators: true },
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
