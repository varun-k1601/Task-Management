const User = require("../models/User");
const Task = require("../models/Task");

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select("-password")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === "admin") {
        return res.status(400).json({ message: "Cannot delete an admin user" });
      }
      await Task.deleteMany({ user: user._id }); // Delete all tasks belonging to user
      await user.deleteOne();
      res.status(200).json({ id: req.params.id, message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent demoting the root admin
      if (user.isRootAdmin && req.body.role && req.body.role !== "admin") {
        return res
          .status(400)
          .json({ message: "Cannot demote the root admin user" });
      }

      // Additional check: Prevent demoting if this is the oldest admin (fallback protection)
      if (user.role === "admin" && req.body.role === "user") {
        const oldestAdmin = await User.findOne({ role: "admin" })
          .sort({ createdAt: 1 })
          .limit(1);

        if (oldestAdmin && oldestAdmin._id.toString() === user._id.toString()) {
          return res
            .status(400)
            .json({ message: "Cannot demote the root/first admin user" });
        }
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();
      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }
    if (req.query.priority && req.query.priority !== "all") {
      query.priority = req.query.priority;
    }

    let sortObj = { createdAt: -1 };
    if (req.query.sortBy === "oldest") sortObj = { createdAt: 1 };
    if (req.query.sortBy === "dueDate") sortObj = { dueDate: 1 };

    const tasks = await Task.find(query)
      .populate("user", "name email")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.status(200).json({
      data: tasks,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/admin/tasks/:id
// @access  Private/Admin
const updateAnyTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("user", "name email");

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/admin/tasks/:id
// @access  Private/Admin
const deleteAnyTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  deleteUser,
  updateUser,
  getAllTasks,
  updateAnyTask,
  deleteAnyTask,
};
