const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getUsers,
  deleteUser,
  updateUser,
  getAllTasks,
  updateAnyTask,
  deleteAnyTask,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id')
  .delete(protect, admin, deleteUser)
  .put(
    protect,
    admin,
    [
      body('name', 'Name must remain a string').optional().isString(),
      body('email', 'Email must be valid').optional().isEmail(),
      body('role', 'Invalid role').optional().isIn(['user', 'admin']),
      handleValidationErrors
    ],
    updateUser
  );

router.route('/tasks').get(protect, admin, getAllTasks);
router.route('/tasks/:id')
  .put(
    protect,
    admin,
    [
      body('title', 'Title must not be empty').optional().not().isEmpty(),
      body('description', 'Description must not be empty').optional().not().isEmpty(),
      body('status', 'Invalid status').optional().isIn(['pending', 'in-progress', 'completed']),
      body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
      body('dueDate', 'Invalid date format').optional().isISO8601().toDate(),
      handleValidationErrors
    ],
    updateAnyTask
  )
  .delete(protect, admin, deleteAnyTask);

module.exports = router;
