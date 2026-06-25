import React from 'react';

export default function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* Bot avatar */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          flexShrink: 0,
        }}>
          🐝
        </div>

        {/* Dots */}
        <div style={{
          background: 'var(--chat-bot-bg)',
          border: '1px solid var(--chat-bot-border)',
          borderRadius: '4px 18px 18px 18px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
