import React from 'react';
import { Sparkles, Search, Building2, MapPin, Star } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  { icon: '🍕', label: 'Restaurants near me', query: 'find restaurants in Pune' },
  { icon: '💻', label: 'Tech services', query: 'SEO and digital marketing services' },
  { icon: '🏥', label: 'Medical & Health', query: 'hospitals and clinics near Indore' },
  { icon: '💅', label: 'Beauty & Spa', query: 'salons and beauty parlors near me' },
  { icon: '🏋️', label: 'Gyms & Fitness', query: 'gyms and yoga studios in Pune' },
  { icon: '🏦', label: 'Banks & ATMs', query: 'ATMs and banks near me' },
];

export default function WelcomeScreen({ onSend }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      textAlign: 'center',
      overflowY: 'auto',
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        background: 'var(--color-primary-light)',
        border: '1px solid var(--color-primary-border)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.6875rem',
        fontWeight: 700,
        color: 'var(--color-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 20,
        animation: 'fadeIn 400ms ease',
      }}>
        <Sparkles size={11} />
        AI-Powered Local Assistant
      </div>

      {/* Logo */}
      <div style={{
        width: 72,
        height: 72,
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        borderRadius: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
        animation: 'scaleIn 300ms ease',
      }}>
        🐝
      </div>

      {/* Heading */}
      <h2 style={{
        fontSize: '1.375rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        lineHeight: 1.3,
        marginBottom: 10,
        animation: 'slideUp 350ms ease',
      }}>
        How can I help you today?
      </h2>

      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        maxWidth: 400,
        lineHeight: 1.6,
        marginBottom: 28,
        animation: 'slideUp 400ms ease',
      }}>
        Ask me to find local businesses, check reviews, add your listing, or manage your profile — in any language.
      </p>

      {/* Quick prompts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 8,
        width: '100%',
        maxWidth: 520,
        animation: 'slideUp 450ms ease',
      }}>
        {SUGGESTED_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onSend(p.query)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              textAlign: 'left',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.color = 'var(--color-primary)';
              e.currentTarget.style.background = 'var(--color-primary-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'var(--bg-surface)';
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{p.icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.label}
            </span>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 24,
        marginTop: 32,
        animation: 'slideUp 500ms ease',
      }}>
        {[
          { icon: <Building2 size={14} />, label: '5,000+ Listings' },
          { icon: <MapPin size={14} />, label: '50+ Cities' },
          { icon: <Star size={14} />, label: 'Real Reviews' },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}>
            {s.icon} {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
