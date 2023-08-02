// backend/routes/api/index.js
const router = require('express').Router();

const sessionRouter = require('./session.js');

const usersRouter = require('./users.js');

const { restoreUser } = require('../../utils/auth.js');

// parse and verify the token
// if everything is fine, user is stored in req.user

router.use(restoreUser);

// Login, logout, Get the current user

router.use('/session', sessionRouter);

// Signup

router.use('/users', usersRouter);

// Test

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

// export default
module.exports = router;