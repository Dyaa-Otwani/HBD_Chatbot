import React, { useState } from 'react';
import {
  Search, RefreshCw, LogIn, MessageSquare, AlertCircle, X, ArrowRight,
  TrendingUp, ChevronRight, ChevronLeft, PlusCircle, MapPin, Type, Trash2,
  Star, Phone, Globe, Copy, Check, ExternalLink
} from 'lucide-react';

// Safe inline markdown renderer (no dangerouslySetInnerHTML)
function MarkdownText({ text }) {
  if (!text) return null;
  const str = String(text);

  // Split by newlines, then process each line
  const lines = str.split('\n');
  return (
    <div className="md-content">
      {lines.map((line, i) => {
        // Process inline formatting: **bold**, *italic*, `code`
        const parts = [];
        let remaining = line;
        let key = 0;

        while (remaining.length > 0) {
          // Bold
          const boldMatch = remaining.match(/^(.*?)\*\*(.*?)\*\*/s);
          if (boldMatch) {
            if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
            parts.push(<strong key={key++} style={{ fontWeight: 700 }}>{boldMatch[2]}</strong>);
            remaining = remaining.slice(boldMatch[0].length);
            continue;
          }
          // Code
          const codeMatch = remaining.match(/^(.*?)`([^`]+)`/s);
          if (codeMatch) {
            if (codeMatch[1]) parts.push(<span key={key++}>{codeMatch[1]}</span>);
            parts.push(<code key={key++}>{codeMatch[2]}</code>);
            remaining = remaining.slice(codeMatch[0].length);
            continue;
          }
          // No more matches
          parts.push(<span key={key++}>{remaining}</span>);
          break;
        }

        return (
          <p key={i} style={{ marginBottom: i < lines.length - 1 ? 4 : 0 }}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}

// Copy to clipboard button
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      style={{
        padding: '2px 6px',
        borderRadius: 6,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface-2)',
        cursor: 'pointer',
        color: copied ? 'var(--color-success)' : 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: '0.6875rem',
        fontWeight: 600,
        transition: 'all 150ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = copied ? 'var(--color-success)' : 'var(--text-muted)'; }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// Star rating renderer
function StarRating({ rating = 0, max = 5 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          size={10}
          fill={i < Math.floor(rating) ? '#f59e0b' : 'none'}
          style={{ color: i < Math.floor(rating) ? '#f59e0b' : 'var(--border-default)' }}
        />
      ))}
      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', marginLeft: 3 }}>
        {rating ? Number(rating).toFixed(1) : '0.0'}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// BUSINESS CARD
// ─────────────────────────────────────────────────────────
function BusinessCard({ biz }) {
  return (
    <div className="biz-card" style={{ marginBottom: 8 }}>
      <div className="biz-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>
              {biz.business_category || 'Business'}
            </span>
            {biz.city && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapPin size={9} /> {biz.city}{biz.state ? `, ${biz.state}` : ''}
              </span>
            )}
          </div>
          <h4 className="biz-card-name">{biz.business_name}</h4>
        </div>
        <StarRating rating={biz.ratings} />
      </div>

      <div className="biz-card-meta">
        {biz.address && (
          <div className="biz-card-meta-row">
            <MapPin size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span>{biz.area ? `${biz.area}, ` : ''}{biz.address}</span>
          </div>
        )}
        {biz.phone_number && (
          <div className="biz-card-meta-row">
            <Phone size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <a href={`tel:${biz.phone_number}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.75rem' }}>
              {biz.phone_number}
            </a>
          </div>
        )}
        {biz.website_url && (
          <div className="biz-card-meta-row">
            <Globe size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <a
              href={biz.website_url.startsWith('http') ? biz.website_url : `https://${biz.website_url}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              Website <ExternalLink size={9} />
            </a>
          </div>
        )}
        {biz.reviews_count > 0 && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Based on {biz.reviews_count} review{biz.reviews_count !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const MessageItem = ({ message, onAction, isLoggedIn, session }) => {
  const isBot = message.role === 'bot';
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  const formatFieldName = (field) =>
    field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const formatDate = (date) => new Date(date).toLocaleString();

  // ── THINKING ──────────────────────────────────────────
  if (message.type === 'thinking') {
    // Handled by TypingIndicator in ChatArea
    return null;
  }

  // ── SEARCH OPTIONS ────────────────────────────────────
  if (message.type === 'search_options') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px 18px 18px 18px',
          padding: 14,
          maxWidth: '85%',
          boxShadow: 'var(--shadow-sm)',
          animation: 'slideUp 250ms ease',
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            {message.content}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onAction('search_by_name')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
            >
              <Type size={13} /> {message.labels?.name || 'By Name'}
            </button>
            <button
              onClick={() => onAction('search_by_address')}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
            >
              <MapPin size={13} /> {message.labels?.address || 'By Area'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── WELCOME CARD ──────────────────────────────────────
  if (message.type === 'welcome_card') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
        <div style={{
          maxWidth: '85%',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          animation: 'slideUp 300ms ease',
        }}>
          <div style={{
            height: 64,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>
            🐝
          </div>
          <div style={{ padding: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 12 }}>
              {message.content}
            </h3>
            {isLoggedIn ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {session?.type === 'BUSINESS' ? (
                  <>
                    <ActionBtn onClick={() => onAction('search')} color="blue" icon={<Search size={14} />}>
                      Show My Business
                    </ActionBtn>
                    <ActionBtn onClick={() => onAction('update')} color="green" icon={<RefreshCw size={14} />}>
                      Update My Business
                    </ActionBtn>
                  </>
                ) : (
                  <ActionBtn onClick={() => onAction('add_new_business')} color="indigo" icon={<PlusCircle size={14} />}>
                    Add Your Business Now
                  </ActionBtn>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 4 }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Login to access business tools
                </p>
                <ActionBtn onClick={() => onAction('login_trigger')} color="indigo" icon={<LogIn size={14} />}>
                  Login Now
                </ActionBtn>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── SUGGESTIONS GRID ──────────────────────────────────
  if (message.type === 'suggestions') {
    const suggestions = Array.isArray(message.content) ? message.content : [];
    if (suggestions.length === 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
          <div style={{
            background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 'var(--radius-lg)',
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem',
          }}>
            <div style={{ width: 28, height: 28, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>✓</div>
            <span style={{ color: '#065f46' }}>Your profile looks complete!</span>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, maxWidth: '95%', animation: 'slideUp 300ms ease' }}>
        {message.intro && (
          <div style={{
            padding: '10px 14px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)', borderRadius: '4px 18px 18px 18px',
            fontSize: '0.875rem', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)',
          }}>
            <MarkdownText text={message.intro} />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onAction('update_specific', item.field)}
              style={{
                background: 'var(--bg-surface)', border: `1px solid ${item.is_missing ? '#fed7aa' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-lg)', padding: '12px 14px',
                cursor: 'pointer', transition: 'all var(--transition-base)',
                position: 'relative', overflow: 'hidden',
                borderLeft: `3px solid ${item.is_missing ? '#f97316' : 'var(--color-primary)'}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</span>
                    {item.is_missing && (
                      <span className="badge badge-warning" style={{ fontSize: '0.5625rem' }}>Missing</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.reason}</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── AUTH PROMPT ───────────────────────────────────────
  if (message.type === 'auth_prompt') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16, animation: 'slideUp 250ms ease' }}>
        <div style={{
          maxWidth: '85%', background: 'var(--color-error-light)',
          border: '1px solid #fca5a5', borderRadius: 'var(--radius-lg)', padding: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
            <AlertCircle style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: 1 }} size={16} />
            <p style={{ fontSize: '0.875rem', color: '#991b1b', lineHeight: 1.5 }}>{message.content}</p>
          </div>
          <ActionBtn onClick={() => onAction('login_trigger')} color="red" icon={<LogIn size={14} />}>
            Login / Register
          </ActionBtn>
        </div>
      </div>
    );
  }

  // ── DATABASE RESPONSE ─────────────────────────────────
  if (message.type === 'database') {
    const items = Array.isArray(message.content) ? message.content
      : Array.isArray(message.data) ? message.data : [];

    if (items.length === 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
          <div className="chat-bubble-bot">No results found.</div>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: 16, animation: 'slideUp 300ms ease' }}>
        {message.intro && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <div className="chat-bubble-bot">{message.intro}</div>
          </div>
        )}
        {items.map((biz, idx) => (
          <BusinessCard key={biz.global_business_id || idx} biz={biz} />
        ))}

        {/* Inline suggestions for missing fields */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)',
            padding: 12, marginTop: 8,
          }}>
            {message.prompt && (
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {message.prompt}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <TrendingUp size={14} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Update Your Profile
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {message.suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onAction('update_specific', s.field)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px', background: 'white', border: '1px solid #fde68a',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef3c7'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{s.title}</span>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{s.reason}</span>
                  </div>
                  <ChevronRight size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── UPDATE CONTROLS ────────────────────────────────────
  if (message.type === 'update_controls') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px',
          display: 'flex', gap: 6,
        }}>
          {[
            { label: '↩ Undo', action: 'undo', color: 'inherit' },
            { label: '🕘 History', action: 'history', color: 'inherit' },
            { label: '✖ Stop', action: 'stop_update', color: 'var(--color-error)' },
          ].map(b => (
            <button
              key={b.action}
              onClick={() => onAction(b.action)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)',
                background: 'transparent', cursor: 'pointer', fontSize: '0.75rem',
                fontWeight: 600, color: b.color || 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── HISTORY ───────────────────────────────────────────
  if (message.type === 'history') {
    return (
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 14, maxWidth: '85%', marginBottom: 12,
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 10 }}>🕒 Update History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(message.content || []).map(item => (
            <div key={item.id} style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: 10 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                {formatFieldName(item.field_name)}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                <span style={{ textDecoration: 'line-through', color: 'var(--color-error)', marginRight: 6 }}>{item.old_value}</span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600, marginLeft: 6 }}>{item.new_value}</span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(item.updated_at)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── MANAGE PRODUCTS ───────────────────────────────────
  if (message.type === 'manage_products') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, animation: 'slideUp 300ms ease' }}>
        {message.intro && (
          <div style={{
            padding: '8px 12px', background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)',
          }}>
            ✨ {message.intro}
          </div>
        )}
        {(message.content || []).map(p => (
          <div key={p.id} className="product-card">
            <div
              style={{
                width: 52, height: 52, background: 'var(--bg-surface-2)', borderRadius: 12,
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, border: '1px solid var(--border-subtle)', cursor: p.image_url ? 'pointer' : 'default',
              }}
              onClick={() => { if (p.image_url) { setActiveImage(p.image_url); setIsPreviewOpen(true); } }}
            >
              {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 20 }}>📦</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '1px 8px', borderRadius: 6, border: '1px solid #6ee7b7' }}>₹{p.price}</span>
                {p.category && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.category}</span>}
              </div>
            </div>
            <button
              onClick={() => onAction('delete_product', p.id)}
              title="Delete Product"
              style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all var(--transition-fast)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'var(--color-error-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Image preview modal */}
        {isPreviewOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 200ms ease',
          }}>
            <button onClick={() => setIsPreviewOpen(false)} style={{
              position: 'absolute', top: 20, right: 20, padding: 8, borderRadius: '50%',
              border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', color: 'white',
            }}>
              <X size={22} />
            </button>
            <img src={activeImage} className="animate-scale-in" alt="Preview"
              style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)' }} />
          </div>
        )}
      </div>
    );
  }

  // ── MANAGE DEALS ──────────────────────────────────────
  if (message.type === 'manage_deals') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, animation: 'slideUp 300ms ease' }}>
        {message.intro && (
          <div style={{
            padding: '8px 12px', background: '#fdf2f8',
            border: '1px solid #f9a8d4', borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem', fontWeight: 700, color: '#9d174d',
          }}>
            🔥 {message.intro}
          </div>
        )}
        {(message.content || []).map(d => (
          <div key={d.id} className="deal-card">
            <div style={{ width: 44, height: 44, background: '#fdf2f8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              🏷️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#be185d', background: '#fce7f3', padding: '1px 8px', borderRadius: 6, border: '1px solid #f9a8d4' }}>{d.discount_pct}% OFF</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Until {d.expiry_date}</span>
              </div>
            </div>
            <button
              onClick={() => onAction('delete_deal', d.id)}
              title="Delete Deal"
              style={{ padding: 8, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all var(--transition-fast)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-error)'; e.currentTarget.style.background = 'var(--color-error-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ── STANDARD TEXT / FAQ ───────────────────────────────
  const content = String(message.content || '');
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 12, gap: 8 }}>
      {/* Bot avatar */}
      {isBot && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0, marginTop: 2,
        }}>
          🐝
        </div>
      )}

      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: isBot ? 'flex-start' : 'flex-end' }}>
        <div className={isBot ? 'chat-bubble-bot' : 'chat-bubble-user'}>
          {isBot ? <MarkdownText text={content} /> : content}
        </div>
        {/* Copy button for bot messages */}
        {isBot && content.length > 20 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CopyButton text={content} />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper: colored action button
function ActionBtn({ onClick, color, icon, children }) {
  const colors = {
    indigo: { bg: 'var(--color-primary)', text: 'white', hover: 'var(--color-primary-hover)' },
    blue:   { bg: '#3b82f6', text: 'white', hover: '#2563eb' },
    green:  { bg: '#10b981', text: 'white', hover: '#059669' },
    red:    { bg: '#ef4444', text: 'white', hover: '#dc2626' },
  };
  const c = colors[color] || colors.indigo;
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '9px 16px', background: c.bg, color: c.text,
        border: 'none', borderRadius: 'var(--radius-md)',
        fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = c.hover; e.currentTarget.style.transform = 'scale(0.99)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = c.bg; e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon}{children}
    </button>
  );
}

export default MessageItem;