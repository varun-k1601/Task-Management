import { useState, useEffect } from "react";
import api from "../api";
import {
  Users,
  FileText,
  Trash2,
  Edit3,
  Save,
  X,
  CheckSquare,
  Clock,
  AlertTriangle,
} from "lucide-react";
import UserDashboard from "./UserDashboard";
import TaskFilterBar from "../components/TaskFilterBar";
import Pagination from "../components/Pagination";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'tasks'
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [taskTotalPages, setTaskTotalPages] = useState(1);

  const [editingUser, setEditingUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const [taskFilters, setTaskFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
    sortBy: "newest",
    page: 1,
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get(`/admin/users?page=${userPage}`);
      setUsers(data.data || data);
      if (data.pagination) setUserTotalPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const queryParams = new URLSearchParams(taskFilters).toString();
      const { data } = await api.get(`/admin/tasks?${queryParams}`);
      setTasks(data.data || data);
      if (data.pagination) setTaskTotalPages(data.pagination.pages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab, userPage]);

  useEffect(() => {
    if (activeTab === "tasks") {
      const db = setTimeout(() => {
        fetchTasks();
      }, 300);
      return () => clearTimeout(db);
    }
  }, [activeTab, taskFilters]);

  // -- User Handlers --
  const handleUserDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user and all their tasks?",
      )
    )
      return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  const handleUserUpdate = async (id, updatedData) => {
    try {
      await api.put(`/admin/users/${id}`, updatedData);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating user");
    }
  };

  // -- Task Handlers --
  const handleTaskDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskUpdate = async (id, updatedData) => {
    try {
      await api.put(`/admin/tasks/${id}`, updatedData);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === "completed") return false;
    return new Date(dateString) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>Admin Dashboard</h2>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            background: "var(--surface)",
            padding: "0.5rem",
            borderRadius: "12px",
          }}
        >
          <button
            className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("users")}
          >
            <Users size={18} /> Manage Users
          </button>
          <button
            className={`btn ${activeTab === "tasks" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("tasks")}
          >
            <FileText size={18} /> Manage All Tasks
          </button>
          <button
            className={`btn ${activeTab === "my-tasks" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("my-tasks")}
          >
            <CheckSquare size={18} /> My Tasks
          </button>
        </div>
      </div>

      {activeTab === "my-tasks" ? (
        <UserDashboard />
      ) : (
        <>
          {activeTab === "tasks" && (
            <TaskFilterBar filters={taskFilters} setFilters={setTaskFilters} />
          )}
          <div className="glass-panel" style={{ overflowX: "auto" }}>
            {activeTab === "users" ? (
              <>
                <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "1rem", color: "var(--text-muted)" }}>
                      Name
                    </th>
                    <th style={{ padding: "1rem", color: "var(--text-muted)" }}>
                      Email
                    </th>
                    <th style={{ padding: "1rem", color: "var(--text-muted)" }}>
                      Role
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        color: "var(--text-muted)",
                        textAlign: "right",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <td style={{ padding: "1rem" }}>
                        {editingUser?._id === user._id ? (
                          <input
                            className="input-field"
                            value={editingUser.name}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {editingUser?._id === user._id ? (
                          <input
                            className="input-field"
                            value={editingUser.email}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                email: e.target.value,
                              })
                            }
                          />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {editingUser?._id === user._id ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <select
                              className="input-field"
                              value={editingUser.role}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  role: e.target.value,
                                })
                              }
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            {user.isRootAdmin && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--warning)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ⚠️ Root Admin
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              background: user.isRootAdmin
                                ? "rgba(236, 72, 153, 0.3)"
                                : user.role === "admin"
                                  ? "rgba(236, 72, 153, 0.2)"
                                  : "rgba(99, 102, 241, 0.2)",
                              color:
                                user.role === "admin"
                                  ? "var(--secondary)"
                                  : "var(--primary)",
                            }}
                          >
                            {user.role} {user.isRootAdmin && "👑"}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        {editingUser?._id === user._id ? (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: "0.5rem",
                            }}
                          >
                            <button
                              className="btn btn-primary"
                              style={{ padding: "0.5rem" }}
                              onClick={() => {
                                // Validation: prevent root admin from changing role
                                if (
                                  user.isRootAdmin &&
                                  editingUser.role !== user.role &&
                                  editingUser.role === "user"
                                ) {
                                  window.alert(
                                    "Root admin cannot be changed from admin to user",
                                  );
                                  return;
                                }
                                handleUserUpdate(user._id, editingUser);
                              }}
                            >
                              <Save size={16} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.5rem" }}
                              onClick={() => setEditingUser(null)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: "0.5rem",
                            }}
                          >
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.5rem" }}
                              onClick={() => setEditingUser({ ...user })}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "0.5rem" }}
                              onClick={() => handleUserDelete(user._id)}
                              disabled={
                                user.role === "admin" || user.isRootAdmin
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={userPage} totalPages={userTotalPages} onPageChange={setUserPage} />
              </>
            ) : (
              <>
                <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className="glass-card"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    {editingTask?._id === task._id ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          height: "100%",
                        }}
                      >
                        <input
                          className="input-field"
                          value={editingTask.title}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              title: e.target.value,
                            })
                          }
                        />
                        <select
                          className="input-field"
                          value={editingTask.status}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <select
                          className="input-field"
                          value={editingTask.priority || "medium"}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              priority: e.target.value,
                            })
                          }
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                        <input
                          type="date"
                          className="input-field"
                          value={
                            editingTask.dueDate
                              ? editingTask.dueDate.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              dueDate: e.target.value,
                            })
                          }
                        />
                        <textarea
                          className="input-field"
                          style={{ flexGrow: 1 }}
                          value={editingTask.description}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              description: e.target.value,
                            })
                          }
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.5rem",
                            marginTop: "1rem",
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              handleTaskUpdate(task._id, editingTask)
                            }
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setEditingTask(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "1.25rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              {task.title}
                              {task.priority === "high" && (
                                <AlertTriangle
                                  size={18}
                                  color="var(--danger)"
                                  title="High Priority"
                                />
                              )}
                            </h3>
                            {task.dueDate && (
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: isOverdue(task.dueDate, task.status)
                                    ? "var(--danger)"
                                    : "var(--text-muted)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  marginTop: "0.25rem",
                                }}
                              >
                                <Clock size={12} />
                                {isOverdue(task.dueDate, task.status)
                                  ? "Overdue: "
                                  : "Due: "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className={`badge`}
                              style={{
                                border: `1px solid ${task.priority === "high" ? "var(--danger)" : task.priority === "medium" ? "var(--warning)" : "var(--success)"}`,
                                color:
                                  task.priority === "high"
                                    ? "var(--danger)"
                                    : task.priority === "medium"
                                      ? "var(--warning)"
                                      : "var(--success)",
                              }}
                            >
                              {task.priority}
                            </span>
                            <span className={`badge badge-${task.status}`}>
                              {task.status.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--primary)",
                            marginBottom: "1rem",
                          }}
                        >
                          Created by: {task.user?.name || "Unknown"} (
                          {task.user?.email})
                        </div>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            flexGrow: 1,
                            marginBottom: "1.5rem",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {task.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.5rem",
                            marginTop: "auto",
                            borderTop: "1px solid var(--border)",
                            paddingTop: "1rem",
                          }}
                        >
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "0.5rem" }}
                            onClick={() => setEditingTask({ ...task })}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "0.5rem" }}
                            onClick={() => handleTaskDelete(task._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <Pagination page={taskFilters.page || 1} totalPages={taskTotalPages} onPageChange={(newPage) => setTaskFilters({ ...taskFilters, page: newPage })} />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
