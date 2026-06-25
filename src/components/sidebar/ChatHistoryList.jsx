import React from 'react';
import { MessageSquare, Clock, Trash2 } from 'lucide-react';
import { SidebarItemSkeleton } from '../ui/Skeleton';

// Group sessions by date
function groupByDate(sessions) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86400000);
  const lastWeek = new Date(today - 7 * 86400000);

  const groups = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };
  sessions.forEach(s => {
    const d = new Date(s.updated_at || s.created_at);
    if (d >= today) groups.Today.push(s);
    else if (d >= yesterday) groups.Yesterday.push(s);
    else if (d >= lastWeek) groups['Last 7 Days'].push(s);
    else groups.Older.push(s);
  });
  return groups;
}

export default function ChatHistoryList({
  sessions,
  currentSessionId,
  loading,
  onLoad,
  onDelete,
  collapsed = false,
}) {
  if (loading) {
    return (
      <div style={{ padding: '0 8px' }}>
        {[...Array(5)].map((_, i) => <SidebarItemSkeleton key={i} />)}
      </div>
    );
  }

  if (sessions.length === 0) {
    if (collapsed) return null;
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px 16px',
        color: 'var(--text-muted)',
      }}>
        <MessageSquare size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
        <p style={{ fontSize: '0.75rem', fontWeight: 500 }}>No chat history yet</p>
        <p style={{ fontSize: '0.6875rem', marginTop: 4, opacity: 0.7 }}>
          Start a conversation to save it here
        </p>
      </div>
    );
  }

  if (collapsed) {
    // Just show icons
    return (
      <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sessions.slice(0, 8).map(s => (
          <button
            key={s.session_id}
            onClick={() => onLoad(s.session_id)}
            title={s.title}
            className={`chat-history-item ${currentSessionId === s.session_id ? 'active' : ''}`}
            style={{ justifyContent: 'center', padding: '8px' }}
          >
            <MessageSquare size={15} className="item-icon" />
          </button>
        ))}
      </div>
    );
  }

  const groups = groupByDate(sessions);

  return (
    <div style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Object.entries(groups).map(([label, items]) => {
        if (items.length === 0) return null;
        return (
          <div key={label}>
            <div style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              padding: '10px 10px 4px',
            }}>
              {label}
            </div>
            {items.map(session => (
              <div
                key={session.session_id}
                className={`chat-history-item ${currentSessionId === session.session_id ? 'active' : ''}`}
                onClick={() => onLoad(session.session_id)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onLoad(session.session_id)}
              >
                <MessageSquare size={13} className="item-icon" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                  }}>
                    {session.title || 'New Chat'}
                  </p>
                  <p style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    marginTop: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <Clock size={9} />
                    {session.updated_at
                      ? new Date(session.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                      : ''}
                  </p>
                </div>
                <button
                  className="delete-btn"
                  onClick={e => onDelete(e, session.session_id)}
                  title="Delete chat"
                  style={{
                    padding: 4,
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    transition: 'color 150ms ease, background 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
