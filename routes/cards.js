const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  deleteCard,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/cards', getCards);

router.delete(
  '/cards/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24),
    }),
  }),
  deleteCard,
);

router.post(
  '/cards',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().alphanum(),
    }),
    headers: Joi.object().keys({
      Authorization: Joi.string().alphanum(),
    }),
  }),
  createCard,
);

router.put('/cards/:cardId/likes', likeCard);

router.delete('/cards/:cardId/likes', dislikeCard);

module.exports = router;
