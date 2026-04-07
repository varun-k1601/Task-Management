import { Search, Filter, SortDesc } from 'lucide-react';

const TaskFilterBar = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
      <div style={{ flexGrow: 1, minWidth: '200px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          name="search"
          placeholder="Search tasks..."
          className="input-field"
          style={{ paddingLeft: '2.5rem', marginBottom: 0 }}
          value={filters.search}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select name="status" className="input-field" style={{ marginBottom: 0, padding: '0.5rem 1rem' }} value={filters.status} onChange={handleChange}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select name="priority" className="input-field" style={{ marginBottom: 0, padding: '0.5rem 1rem' }} value={filters.priority} onChange={handleChange}>
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SortDesc size={16} color="var(--text-muted)" />
          <select name="sortBy" className="input-field" style={{ marginBottom: 0, padding: '0.5rem 1rem' }} value={filters.sortBy} onChange={handleChange}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueDate">Due Date (Soonest)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilterBar;
