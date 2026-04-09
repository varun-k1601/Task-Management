import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Edit3, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import TaskFilterBar from '../components/TaskFilterBar';
import Pagination from '../components/Pagination';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
  const [isEditing, setIsEditing] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all', sortBy: 'newest', page: 1 });
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/tasks?${queryParams}`);
      setTasks(data.data || data);
      if (data.pagination) setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/tasks/${isEditing}`, formData);
        setIsEditing(null);
      } else {
        await api.post('/tasks', formData);
      }
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (task) => {
    setIsEditing(task._id);
    setFormData({ 
      title: task.title, 
      description: task.description, 
      status: task.status,
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const statuses = ['pending', 'in-progress', 'completed'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    
    try {
      await api.put(`/tasks/${id}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === 'completed') return false;
    return new Date(dateString) < new Date(new Date().setHours(0,0,0,0));
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>My Tasks</h2>
      
      <TaskFilterBar filters={filters} setFilters={setFilters} />

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h3>{isEditing ? 'Edit Task' : 'Create New Task'}</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                name="title" 
                placeholder="Task Title"
                className="input-field" 
                value={formData.title} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <select name="status" className="input-field" value={formData.status} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <select name="priority" className="input-field" value={formData.priority} onChange={handleChange}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <input 
                type="date" 
                name="dueDate" 
                className="input-field" 
                value={formData.dueDate} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <textarea 
                name="description" 
                placeholder="Task Description"
                className="input-field" 
                value={formData.description} 
                onChange={handleChange} 
                required
                rows="3"
              />
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">
              {isEditing ? <><Edit3 size={18} /> Update Task</> : <><Plus size={18} /> Add Task</>}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                setIsEditing(null);
                setFormData({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
              }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {tasks.map(task => (
          <div key={task._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {task.title}
                  {task.priority === 'high' && <AlertTriangle size={18} color="var(--danger)" title="High Priority" />}
                </h3>
                {task.dueDate && (
                  <div style={{ fontSize: '0.8rem', color: isOverdue(task.dueDate, task.status) ? 'var(--danger)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <Clock size={12} /> 
                    {isOverdue(task.dueDate, task.status) ? 'Overdue: ' : 'Due: '}
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span 
                  className={`badge`} 
                  style={{ 
                    border: `1px solid ${task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)'}`,
                    color: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)'
                  }}
                >
                  {task.priority}
                </span>
                <span 
                  className={`badge badge-${task.status}`} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStatusChange(task._id, task.status)}
                  title="Click to toggle status"
                >
                  {task.status.replace('-', ' ')}
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', flexGrow: 1, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
              {task.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => handleEdit(task)} title="Edit Task">
                <Edit3 size={16} />
              </button>
              <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(task._id)} title="Delete Task">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No tasks yet. Create one above!</p>
          </div>
        )}
      </div>
      <Pagination page={filters.page || 1} totalPages={totalPages} onPageChange={(newPage) => setFilters({ ...filters, page: newPage })} />
    </div>
  );
};

export default UserDashboard;
