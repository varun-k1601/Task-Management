const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { registerUser, loginUser, getMe, updateProfile, logoutUser, refreshAccessToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  handleValidationErrors
], registerUser);

router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists(),
  handleValidationErrors
], loginUser);

router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
