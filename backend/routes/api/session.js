// backend/routes/api/session.js
const express = require('express')

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateLogin = [
  check('credential')
    .exists({ checkFalsy: true }).notEmpty().withMessage('Email or username is required'),
  check('password')
    .exists({ checkFalsy: true }).withMessage('Password is required'),
  handleValidationErrors
];

// 1-4 Log in
router.post('/', validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;
  const user = await User.unscoped().findOne({
    where: {
      [Op.or]: {
        username: credential,
        email: credential
      }
    }
  });
  // 401 Invalid Credentials or wrong password
  if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
    res.status(401);
    const resObj = {
      message: "Invalid credentials",
      errors: {
        invalidCredentials: "Error: The email/username and password you provided doesn't match with our records.",
      },
    }
    return res.json(resObj);
  }
  // extract information needded
  const { id, firstName, lastName, email, username } = user;
  const safeUser = { id, firstName, lastName, email, username };
  // set token cookie
  await setTokenCookie(res, safeUser);
  // return user information as json
  return res.json({ user: safeUser });
});

// Log out
router.delete('/', (_req, res) => {
  res.clearCookie('token');
  return res.json({ message: 'success' });
});

// 1-3 Get the Current User / Restore session user
router.get('/', (req, res) => {
  const { user } = req;
  if (!user) {
    return res.json({ user: null });
  }
  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };
  return res.json({
    user: safeUser
  });
});

module.exports = router;