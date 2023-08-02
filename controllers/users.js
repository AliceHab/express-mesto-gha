const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-req-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const ConflictError = require('../errors/conflict-err');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      } else if (err.kind === 'ObjectId') {
        throw new BadRequestError('Ошибка в данных');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar, password, email } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, about, avatar, email, password: hash }))
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      console.log(err);
      // eslint-disable-next-line no-underscore-dangle
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Ошибка в данных');
      }
      if (err.code === 11000) {
        throw new ConflictError('Почта занята');
      }
      next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .select('+password')
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        '2eff316546783160b0e6bfaf8a81862d',
        {
          expiresIn: '7d',
        }
      );

      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Ошибка в данных');
      }
      throw new UnauthorizedError('Ошибка аутентификации');
      next(err);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { name, about } = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(
    owner,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: true,
    }
  )
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Ошибка в данных');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const avatar = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(owner, avatar, {
    new: true,
    runValidators: true,
    upsert: true,
  })
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      } else if (err.kind === 'ObjectId') {
        throw new BadRequestError('Ошибка в данных');
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  const owner = req.user._id;
  console.log(req);

  User.findById(owner)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        throw new NotFoundError('Пользователь не найден');
      } else if (err.kind === 'ObjectId') {
        throw new BadRequestError('Ошибка в данных');
      } else {
        next(err);
      }
    })
    .catch(next);
};
