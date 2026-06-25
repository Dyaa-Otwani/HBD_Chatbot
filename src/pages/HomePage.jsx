import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, MapPin, TrendingUp, Star, Building2, Globe, ChevronRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { CategoryCardSkeleton, BusinessCardSkeleton } from '../components/ui/Skeleton';

// Category emoji map
const CATEGORY_EMOJIS = {
  'Restaurant': '🍽️', 'Cafe': '☕', 'Hotel': '🏨', 'Gym': '💪',
  'Salon': '💅', 'Hospital': '🏥', 'School': '🏫', 'Bank': '🏦',
  'Shop': '🛍️', 'Medical': '💊', 'Clinic': '🩺', 'Grocery': '🛒',
  'Electronics': '📱', 'Automobile': '🚗', 'Travel': '✈️', 'Clothing': '👗',
  'Spa': '🧖', 'Bakery': '🥐', 'Pharmacy': '💊', 'Jewellery': '💍',
  'default': '🏢',
};

function getCategoryEmoji(category) {
  if (!category) return CATEGORY_EMOJIS.default;
  const key = Object.keys(CATEGORY_EMOJIS).find(k =>
    k.toLowerCase() !== 'default' && category.toLowerCase().includes(k.toLowerCase())
  );
  return key ? CATEGORY_EMOJIS[key] : CATEGORY_EMOJIS.default;
}

const GRADIENT_PAIRS = [
  ['#4f46e5', '#7c3aed'],
  ['#059669', '#10b981'],
  ['#dc2626', '#ef4444'],
  ['#d97706', '#f59e0b'],
  ['#db2777', '#f472b6'],
  ['#0284c7', '#38bdf8'],
  ['#7c3aed', '#a855f7'],
  ['#065f46', '#059669'],
];

function CategoryCard({ category, index, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [g1, g2] = GRADIENT_PAIRS[index % GRADIENT_PAIRS.length];
  const emoji = getCategoryEmoji(category.name || category.category);
  const name = category.name || category.category || 'Unknown';
  const count = category.count ?? category.total;

  return (
    <div
      onClick={() => onClick(name)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${hovered ? g1 : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        animation: `slideUp ${200 + index * 30}ms ease both`,
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: hovered ? `linear-gradient(135deg, ${g1}, ${g2})` : `linear-gradient(135deg, ${g1}22, ${g2}22)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, transition: 'background var(--transition-base)',
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </p>
        {count !== undefined && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {count} listings
          </p>
        )}
      </div>
      <ChevronRight size={14} style={{
        color: hovered ? g1 : 'var(--text-muted)',
        transition: 'color var(--transition-base), transform var(--transition-base)',
        transform: hovered ? 'translateX(2px)' : 'none',
        flexShrink: 0,
      }} />
    </div>
  );
}

function TrendingBusinessCard({ biz, index }) {
  return (
    <div
      className="card card-interactive"
      style={{ animation: `slideUp ${200 + index * 40}ms ease both` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {biz.business_category && (
              <span className="badge badge-primary">{biz.business_category}</span>
            )}
            {biz.city && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                <MapPin size={9} />{biz.city}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {biz.business_name}
          </h3>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginLeft: 8,
          background: '#fef3c7', padding: '3px 8px', borderRadius: 8, border: '1px solid #fde68a',
        }}>
          <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e' }}>
            {biz.ratings ? Number(biz.ratings).toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>
      {biz.address && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {biz.area ? `${biz.area}, ` : ''}{biz.address}
        </p>
      )}
    </div>
  );
}

const QUICK_SEARCHES = [
  { emoji: '🍕', label: 'Pizza & Fast Food' },
  { emoji: '☕', label: 'Cafes & Coffee Shops' },
  { emoji: '💅', label: 'Salons & Beauty' },
  { emoji: '🏥', label: 'Hospitals & Clinics' },
  { emoji: '💪', label: 'Gyms & Fitness' },
  { emoji: '🛍️', label: 'Shopping & Retail' },
];

export default function HomePage({ toast }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const inputRef = useRef();

  useEffect(() => {
    api.getCategories()
      .then(data => setCategories(Array.isArray(data) ? data.slice(0, 12) : []))
      .catch(() => toast?.error('Failed to load categories'))
      .finally(() => setCategoriesLoading(false));

    api.getTrending()
      .then(data => setTrending(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  const goToChat = (query = '') => {
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/chat');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) goToChat(searchQuery.trim());
    else inputRef.current?.focus();
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }} className="no-scrollbar">

      {/* ── HERO ────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '60px 24px 80px',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(40px)' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20,
          padding: '5px 14px', borderRadius: 'var(--radius-full)',
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
          textTransform: 'uppercase', letterSpacing: '0.07em',
          animation: 'fadeIn 500ms ease',
        }}>
          <Sparkles size={11} /> AI-Powered · Local Business Search
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 900, color: 'white', lineHeight: 1.2,
          marginBottom: 16, maxWidth: 560, margin: '0 auto 16px',
          animation: 'slideUp 400ms ease',
        }}>
          Find Local Businesses <br />
          <span style={{ color: '#a78bfa' }}>with AI</span>
        </h1>

        <p style={{
          fontSize: '1rem', color: 'rgba(255,255,255,0.75)', maxWidth: 440,
          margin: '0 auto 32px', lineHeight: 1.6,
          animation: 'slideUp 450ms ease',
        }}>
          Search restaurants, shops, services and more in natural language. Add and manage your business listing for free.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{ maxWidth: 540, margin: '0 auto', animation: 'slideUp 500ms ease' }}
        >
          <div style={{
            display: 'flex', gap: 0, background: 'white', borderRadius: 'var(--radius-xl)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.3)', overflow: 'hidden',
            border: '2px solid transparent',
            transition: 'border-color var(--transition-fast)',
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = '#a78bfa'; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ color: '#94a3b8' }} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Try: Best cafe in Pune, or medical stores near me..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none', padding: '14px 8px',
                fontSize: '0.9375rem', color: '#1e293b', background: 'transparent',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 20px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'opacity var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              Search <ArrowRight size={15} />
            </button>
          </div>
        </form>

        {/* Quick search pills */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap',
          marginTop: 20, animation: 'slideUp 550ms ease',
        }}>
          {QUICK_SEARCHES.map((q, i) => (
            <button
              key={i}
              onClick={() => goToChat(q.label)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all var(--transition-fast)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            >
              {q.emoji} {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ───────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(24px, 6vw, 64px)',
        flexWrap: 'wrap',
      }}>
        {[
          { value: '5,000+', label: 'Business Listings', icon: <Building2 size={18} style={{ color: '#4f46e5' }} /> },
          { value: '50+', label: 'Cities Covered', icon: <MapPin size={18} style={{ color: '#10b981' }} /> },
          { value: '100+', label: 'Categories', icon: <Globe size={18} style={{ color: '#f59e0b' }} /> },
          { value: '4.8★', label: 'Average Rating', icon: <Star size={18} style={{ color: '#f59e0b' }} /> },
        ].map((stat, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, animation: `fadeIn ${300 + i * 80}ms ease` }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--bg-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── CATEGORIES ───────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Browse Categories</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {categoriesLoading ? 'Loading...' : `${categories.length} categories available`}
              </p>
            </div>
            <button
              onClick={() => goToChat('show all categories')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)',
                color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
          }}>
            {categoriesLoading
              ? [...Array(8)].map((_, i) => <CategoryCardSkeleton key={i} />)
              : categories.map((cat, i) => (
                  <CategoryCard
                    key={i}
                    category={cat}
                    index={i}
                    onClick={(name) => goToChat(`find ${name} near me`)}
                  />
                ))
            }
          </div>
        </section>

        {/* ── TRENDING ─────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <TrendingUp size={18} style={{ color: '#f59e0b' }} />
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Top Rated Businesses</h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest rated in your area</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {trendingLoading
              ? [...Array(6)].map((_, i) => <BusinessCardSkeleton key={i} />)
              : trending.length > 0
                ? trending.map((biz, i) => <TrendingBusinessCard key={i} biz={biz} index={i} />)
                : (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Star size={32} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.875rem' }}>No trending businesses available yet</p>
                  </div>
                )
            }
          </div>
        </section>

        {/* ── CTA BANNER ────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white', marginBottom: 6 }}>
              🏢 Own a Business?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, maxWidth: 360 }}>
              Add your listing for free and reach thousands of customers in your area. Manage products, deals, and more through our AI assistant.
            </p>
          </div>
          <button
            onClick={() => goToChat('add my business')}
            style={{
              padding: '12px 24px', borderRadius: 'var(--radius-md)',
              background: 'white', color: '#4f46e5',
              border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9375rem',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
          >
            Add Your Business <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
      }}>
        <p>© 2024 CityHangAround · Powered by <strong style={{ color: 'var(--color-primary)' }}>Honeybee Digitals</strong> · AI Local Business Assistant</p>
      </footer>
    </div>
  );
}
