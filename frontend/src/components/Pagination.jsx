import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
      <button 
        className="btn btn-secondary" 
        disabled={page <= 1} 
        onClick={() => onPageChange(page - 1)}
        style={{ padding: '0.5rem' }}
        title="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>
      <span style={{ color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
      <button 
        className="btn btn-secondary" 
        disabled={page >= totalPages} 
        onClick={() => onPageChange(page + 1)}
        style={{ padding: '0.5rem' }}
        title="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
