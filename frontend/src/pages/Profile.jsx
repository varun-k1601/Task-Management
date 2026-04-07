import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, AlignLeft, Check, AlertCircle, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: '', bio: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', bio: user.bio || '' });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ text: '', type: '' });
    try {
      await updateProfile(formData.name, formData.bio);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} title="Back to Dashboard">
          <ArrowLeft size={20} />
        </Link>
        <h2 style={{ margin: 0 }}>My Profile</h2>
      </div>
      
      <div className="glass-panel">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {message.text && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? 'var(--secondary)' : 'var(--danger)',
              border: `1px solid ${message.type === 'success' ? 'var(--secondary)' : 'var(--danger)'}`
            }}>
              {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Display Name</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="name"
                className="input-field" 
                style={{ paddingLeft: '3rem' }}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Bio</label>
            <div style={{ position: 'relative' }}>
              <AlignLeft size={20} style={{ position: 'absolute', left: '1rem', top: '1.2rem', color: 'var(--text-muted)' }} />
              <textarea 
                name="bio"
                className="input-field" 
                style={{ paddingLeft: '3rem', minHeight: '120px', paddingTop: '1rem' }}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isUpdating} style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Check size={18} />
            {isUpdating ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
