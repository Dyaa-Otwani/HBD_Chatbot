import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Search, ChevronRight, Tag, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { CategoryCardSkeleton } from '../components/ui/Skeleton';

// Japanese-inspired delicate colors
const ACENT_COLORS = [
  '#5a52a3', // Soft Indigo
  '#4a6b5c', // Moss Green
  '#a36e52', // Soft Terracotta
  '#6b52a3', // Soft Iris
  '#3f5a6b', // Slate Blue
  '#a35265', // Sakura Gold/Red
];

export default function CategoriesPage({ toast }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    api.getCategories()
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => toast?.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => {
    const name = cat.name || cat.category || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCategoryClick = (name) => {
    navigate(`/chat?q=${encodeURIComponent(`find ${name} near me`)}`);
  };

  return (
    <div 
      style={{ 
        flex: 1, 
        overflowY: 'auto', 
        background: 'var(--bg-base)',
        padding: '24px 32px'
      }} 
      className="no-scrollbar"
    >
      {/* ─── JAPANESE MINIMALIST HEADER ─────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 24,
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: 800, 
              letterSpacing: '0.15em', 
              color: 'var(--color-primary)', 
              textTransform: 'uppercase',
              background: 'var(--color-primary-light)',
              padding: '3px 8px',
              borderRadius: 4
            }}>
              Discover
            </span>
          </div>
          <h1 style={{ 
            fontSize: '1.625rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Business Categories
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Explore local services, shops, and businesses curated by category
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchCategories}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 200ms ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Reload
        </button>
      </div>

      {/* ─── SEARCH & FILTER BAR ─────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 480,
        marginBottom: 32,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder="Filter categories..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            background: 'transparent',
            color: 'var(--text-primary)',
          }}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ─── MAIN GRID ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16
        }}>
          {[...Array(12)].map((_, i) => <CategoryCardSkeleton key={i} />)}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 16
        }}>
          {filteredCategories.map((cat, i) => {
            const name = cat.name || cat.category || 'Unknown';
            const count = cat.count ?? cat.total ?? 0;
            const accentColor = ACENT_COLORS[i % ACENT_COLORS.length];

            return (
              <div
                key={i}
                onClick={() => handleCategoryClick(name)}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '20px 22px',
                  cursor: 'pointer',
                  transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: 120,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="category-page-card"
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}12`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Thin side color indicator */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: accentColor
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${accentColor}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: accentColor
                  }}>
                    <Tag size={14} />
                  </div>
                  
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    background: 'var(--bg-surface-2)',
                    padding: '2px 8px',
                    borderRadius: 10
                  }}>
                    {count} {count === 1 ? 'listing' : 'listings'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '85%'
                  }}>
                    {name}
                  </h3>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '64px 0',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 12,
          background: 'var(--bg-surface)',
          maxWidth: 480,
          margin: '0 auto'
        }}>
          <Grid size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: 12 }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            No categories found matching "{searchTerm}"
          </p>
          <button 
            onClick={() => setSearchTerm('')}
            style={{
              marginTop: 12,
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
}
