const User = require('../models/user');

const checkUser = (err, res) => {
  if (err.kind === 'ObjectId') {
    return res
      .status(404)
      .send({ message: 'Пользователь с указанным _id не найден' });
  }
};

const checkDate = (err, res, errorText) => {
  if (err.name === 'ValidationError') {
    return res.status(400).send({
      message: errorText,
    });
  }
};

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: 'Пользователь с указанным _id не найден' });
      }
      res.send({ data: user });
    })
    .catch((err) => {
      checkUser(err, res);
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      checkDate(
        err,
        res,
        'Переданы некорректные данные при создании пользователя',
      );
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(
    owner,
    { name, about },
    {
      new: true,
      runValidators: true,
      upsert: true,
    },
  )
    .then((user) => {
      checkUser(user, res);
      res.send({ data: user });
    })
    .catch((err) => {
      checkDate(
        err,
        res,
        'Переданы некорректные данные при обновлении профиля',
      );
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};

module.exports.updateAvatar = (req, res) => {
  const avatar = req.body;
  const owner = req.user._id;

  User.findByIdAndUpdate(owner, avatar)
    .then((user) => {
      checkUser(user, res);
      res.send({ data: user });
    })
    .catch((err) => {
      checkDate(
        err,
        res,
        'Переданы некорректные данные при обновлении аватара',
      );
      res.status(500).send({ message: 'Произошла ошибка' });
    });
};
