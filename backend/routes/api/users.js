// backend/routes/api/users.js
const express = require('express')
const bcrypt = require('bcryptjs');

const { setTokenCookie } = require('../../utils/auth');
const { User } = require('../../db/models');
const { Op } = require('sequelize');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

// const validateSignup = [
//   check('email').exists({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
//   check('username').exists({ checkFalsy: true }, "Username is required").isLength({ min: 4 }).withMessage('Please provide a username with at least 4 characters.'),
//   check('username').not().isEmail().withMessage('Username cannot be an email.'),
//   check('password').exists({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be 6 characters or more.'),
//   handleValidationErrors
// ];

const router = express.Router();

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true }).isEmail().withMessage("Invalid email")
    .isLength({ max: 256, min: 3 }).withMessage("Email need to have 3 to 256 characters"),
  check('username')
    .exists({ checkFalsy: true }).withMessage("Username is required")
    .isLength({ max: 30, min: 4 }).withMessage("Username must be 4 to 30 characters long")
    .not().isEmail().withMessage('Username cannot be an email.'),
  check('firstName')
    .exists({ checkFalsy: true }).withMessage("First Name is required")
    .isLength({ max: 30, min: 1 }).withMessage("First Name must be 1 to 30 characters long"),
  check('lastName')
    .exists({ checkFalsy: true }).withMessage("Last Name is required")
    .isLength({ max: 30, min: 1 }).withMessage("Last Name must be 1 to 30 characters long"),
  check('password')
    .exists({ checkFalsy: true }).withMessage("Password is required")
    .isLength({ min: 6 }).withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

// Sign up
router.post('/', validateSignup, async (req, res) => {
  const { email, firstName, lastName, password, username } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  // Try to find the user using email
  const findUserByEmail = await User.findOne({
    where: { email: email }
  });
  // If we find the user, that means the user already exists
  if (findUserByEmail) {
    res.status(500);
    const resObj = {
      message: "User already exists",
      errors: { email: "User with that email already exists" }
    };
    return res.json(resObj)
  }
  // Try to find the user using username
  const findUserByUsername = await User.findOne({
    where: { username: username }
  });
  // If we find the user, that means the user already exists
  if (findUserByUsername) {
    res.status(500);
    const resObj = {
      message: "User already exists",
      errors: { username: "User with that username already exists" }
    };
    return res.json(resObj)
  }
  // If we did not find the user, continue the register progress
  const user = await User.create({ email, firstName, lastName, username, hashedPassword });
  // extract the information we need
  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };
  // send the JWT token
  await setTokenCookie(res, safeUser);
  // send json response
  return res.json({
    user: safeUser
  });
});

module.exports = router;