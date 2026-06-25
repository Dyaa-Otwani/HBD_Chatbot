import React from 'react';

// Skeleton primitives
export function SkeletonLine({ width = '100%', height = 14, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: 6 }}
    />
  );
}

export function SkeletonCircle({ size = 40 }) {
  return (
    <div
      className="skeleton"
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

// Business card skeleton
export function BusinessCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonLine width={60} height={18} />
        <SkeletonLine width={50} height={18} />
      </div>
      <SkeletonLine width="80%" height={14} />
      <SkeletonLine width="60%" height={12} />
      <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
        <SkeletonLine width={40} height={10} />
        <SkeletonLine width={40} height={10} />
        <SkeletonLine width={40} height={10} />
      </div>
    </div>
  );
}

// Category card skeleton
export function CategoryCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <SkeletonCircle size={48} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonLine width="70%" height={13} />
        <SkeletonLine width="40%" height={11} />
      </div>
    </div>
  );
}

// Message bubble skeleton
export function MessageSkeleton({ isBot = true }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isBot ? 'flex-start' : 'flex-end',
      marginBottom: 12,
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: isBot ? '4px 18px 18px 18px' : '18px 18px 4px 18px',
        padding: '10px 14px',
        maxWidth: '65%',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        <SkeletonLine width="100%" height={12} />
        <SkeletonLine width="75%" height={12} />
        <SkeletonLine width="50%" height={12} />
      </div>
    </div>
  );
}

// Sidebar history item skeleton
export function SidebarItemSkeleton() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 10px',
    }}>
      <SkeletonCircle size={18} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="80%" height={11} />
      </div>
    </div>
  );
}
