const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.route('/')
  .get(protect, getTasks)
  .post(
    protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
      body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
      body('dueDate', 'Invalid date format').optional().isISO8601().toDate(),
      handleValidationErrors
    ],
    createTask
  );

router.route('/:id')
  .put(
    protect,
    [
      body('title', 'Title must not be empty').optional().not().isEmpty(),
      body('description', 'Description must not be empty').optional().not().isEmpty(),
      body('status', 'Invalid status').optional().isIn(['pending', 'in-progress', 'completed']),
      body('priority', 'Invalid priority').optional().isIn(['low', 'medium', 'high']),
      body('dueDate', 'Invalid date format').optional().isISO8601().toDate(),
      handleValidationErrors
    ],
    updateTask
  )
  .delete(protect, deleteTask);

module.exports = router;
