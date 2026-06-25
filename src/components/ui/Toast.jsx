import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const CONFIGS = {
  success: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', border: '#6ee7b7', progress: '#10b981' },
  error:   { icon: XCircle,     color: '#ef4444', bg: '#fee2e2', border: '#fca5a5', progress: '#ef4444' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7', border: '#fde68a', progress: '#f59e0b' },
  info:    { icon: Info,         color: '#3b82f6', bg: '#dbeafe', border: '#93c5fd', progress: '#3b82f6' },
};

function ToastItem({ toast, onDismiss }) {
  const cfg = CONFIGS[toast.type] || CONFIGS.info;
  const Icon = cfg.icon;

  return (
    <div
      className={`toast${toast.exiting ? ' exiting' : ''}`}
      style={{ borderColor: cfg.border }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div style={{ color: cfg.color, marginTop: 1, flexShrink: 0 }}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {toast.message}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          flexShrink: 0,
          padding: 2,
          borderRadius: 6,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div
          className="toast-progress"
          style={{
            background: cfg.progress,
            animation: `progress ${toast.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
