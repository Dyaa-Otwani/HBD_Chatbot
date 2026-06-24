import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  Building2, MapPin, Star, TrendingUp, Users, MessageSquare,
  Package, Tag, Globe, RefreshCw, Download, Filter,
  Activity, BarChart2, PieChart as PieIcon, Award, Zap
} from 'lucide-react';
import { api } from '../services/api';

// ─── COLOR PALETTE (Power BI inspired) ───────────────────────────────────────
const COLORS = [
  '#4f46e5', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316',
  '#ec4899', '#6366f1', '#14b8a6', '#eab308', '#dc2626',
];

const GRADIENT_PAIRS = [
  { from: '#4f46e5', to: '#7c3aed' },
  { from: '#0ea5e9', to: '#06b6d4' },
  { from: '#10b981', to: '#059669' },
  { from: '#f59e0b', to: '#d97706' },
  { from: '#ef4444', to: '#dc2626' },
  { from: '#8b5cf6', to: '#6d28d9' },
];

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: 'var(--shadow-xl)',
      fontSize: '0.8125rem',
    }}>
      {label && <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color || entry.fill }} />
          <span style={{ color: 'var(--text-secondary)' }}>{entry.name}: </span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, gradient, trend, loading }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${gradient?.from || '#4f46e5'}, ${gradient?.to || '#7c3aed'})`
          : 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 300ms ease',
        boxShadow: hovered ? `0 8px 32px ${gradient?.from || '#4f46e5'}40` : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', opacity: 0.1,
        background: hovered ? 'white' : (gradient?.from || '#4f46e5'),
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hovered ? 'rgba(255,255,255,0.2)' : `${gradient?.from || '#4f46e5'}18`,
          flexShrink: 0,
        }}>
          <span style={{ color: hovered ? 'white' : (gradient?.from || '#4f46e5'), lineHeight: 1 }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700, padding: '3px 8px', borderRadius: 8,
            background: hovered ? 'rgba(255,255,255,0.2)' : (trend >= 0 ? '#d1fae5' : '#fee2e2'),
            color: hovered ? 'white' : (trend >= 0 ? '#065f46' : '#991b1b'),
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ marginTop: 14 }}>
        {loading ? (
          <div style={{ height: 28, background: 'var(--bg-surface-2)', borderRadius: 8, width: '60%', marginBottom: 8 }} />
        ) : (
          <p style={{
            fontSize: '1.5rem', fontWeight: 900, lineHeight: 1,
            color: hovered ? 'white' : 'var(--text-primary)',
            marginBottom: 4,
          }}>
            {value}
          </p>
        )}
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: hovered ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
          {label}
        </p>
        {sub && (
          <p style={{ fontSize: '0.6875rem', color: hovered ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', marginTop: 2 }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── CHART CARD ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, loading, height = 300, span = 1 }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      gridColumn: `span ${span}`,
      transition: 'box-shadow var(--transition-base)',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
        </div>
        <BarChart2 size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
      <div style={{ padding: '16px 20px', height }}>
        {loading ? (
          <div style={{ height: '100%', background: 'var(--bg-surface-2)', borderRadius: 12, animation: 'pulse 1.5s ease infinite' }} />
        ) : children}
      </div>
    </div>
  );
}

// ─── TOP BUSINESS TABLE ──────────────────────────────────────────────────────
function TopBusinessTable({ data, loading }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
            {['#', 'Business', 'Category', 'City', 'Rating', 'Reviews'].map(h => (
              <th key={h} style={{
                padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(6)].map((_, j) => (
                  <td key={j} style={{ padding: '12px' }}>
                    <div style={{ height: 14, background: 'var(--bg-surface-2)', borderRadius: 4, width: `${60 + j * 10}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : (data || []).map((biz, i) => (
            <tr key={i} style={{
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background var(--transition-fast)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                {i + 1}
              </td>
              <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 200 }}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {biz.business_name}
                </div>
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                }}>
                  {biz.business_category || '—'}
                </span>
              </td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                {biz.city || '—'}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: 700, color: '#92400e' }}>{Number(biz.ratings || 0).toFixed(1)}</span>
                </div>
              </td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {(biz.reviews_count || 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN ANALYTICS PAGE ─────────────────────────────────────────────────────
export default function AnalyticsPage({ toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const result = await api.getAnalytics();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      toast?.error('Failed to load analytics data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const topBusinesses = data?.top_businesses || [];

  // Prepare chart data
  const categoriesData = (charts.categories_by_count || []).slice(0, 10).map(d => ({
    name: d.name?.length > 20 ? d.name.slice(0, 17) + '...' : d.name,
    fullName: d.name,
    count: d.count,
  }));

  const citiesData = (charts.cities_distribution || []).slice(0, 8);
  const statesData = (charts.states_distribution || []).slice(0, 8);
  const ratingsData = charts.ratings_distribution || [];
  const monthlyData = (charts.monthly_registrations || []).map(d => ({
    ...d, month: d.month ? d.month.replace('-', '/') : d.month,
  }));

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg-base)',
      padding: '0',
    }}
      className="no-scrollbar"
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        padding: '24px 28px 20px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BarChart2 size={18} style={{ color: 'white' }} />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                Analytics Dashboard
              </h1>
              <span style={{
                fontSize: '0.625rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>LIVE</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Real-time insights from {kpis.total_businesses?.toLocaleString() || '...'} businesses across India
              {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)',
                background: autoRefresh ? 'var(--color-primary-light)' : 'var(--bg-surface-2)',
                color: autoRefresh ? 'var(--color-primary)' : 'var(--text-secondary)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Activity size={14} />
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </button>
            <button
              onClick={() => { setLoading(true); fetchAnalytics(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-2)',
                color: 'var(--text-secondary)',
                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>

        {/* ── KPI CARDS ─────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}>
          <KpiCard
            icon={<Building2 size={20} />}
            label="Total Businesses"
            value={loading ? '...' : kpis.total_businesses?.toLocaleString()}
            sub="Across all cities"
            gradient={GRADIENT_PAIRS[0]}
            loading={loading}
          />
          <KpiCard
            icon={<PieIcon size={20} />}
            label="Categories"
            value={loading ? '...' : kpis.total_categories}
            sub="Unique business types"
            gradient={GRADIENT_PAIRS[1]}
            loading={loading}
          />
          <KpiCard
            icon={<MapPin size={20} />}
            label="Cities Covered"
            value={loading ? '...' : kpis.total_cities}
            sub={`${kpis.total_states || 0} states`}
            gradient={GRADIENT_PAIRS[2]}
            loading={loading}
          />
          <KpiCard
            icon={<Star size={20} />}
            label="Avg Rating"
            value={loading ? '...' : `${kpis.avg_rating}★`}
            sub={`${kpis.top_rated_count || 0} top rated`}
            gradient={GRADIENT_PAIRS[3]}
            loading={loading}
          />
          <KpiCard
            icon={<TrendingUp size={20} />}
            label="Total Reviews"
            value={loading ? '...' : kpis.total_reviews?.toLocaleString()}
            sub="Combined reviews"
            gradient={GRADIENT_PAIRS[4]}
            loading={loading}
          />
          <KpiCard
            icon={<Package size={20} />}
            label="Products Listed"
            value={loading ? '...' : kpis.total_products}
            sub="Business products"
            gradient={GRADIENT_PAIRS[5]}
            loading={loading}
          />
          <KpiCard
            icon={<Tag size={20} />}
            label="Active Deals"
            value={loading ? '...' : kpis.total_deals}
            sub="Discount offers"
            gradient={GRADIENT_PAIRS[0]}
            loading={loading}
          />
          <KpiCard
            icon={<MessageSquare size={20} />}
            label="Chat Sessions"
            value={loading ? '...' : kpis.total_chats}
            sub={`${kpis.total_users || 0} unique users`}
            gradient={GRADIENT_PAIRS[1]}
            loading={loading}
          />
        </div>

        {/* ── CHARTS GRID ROW 1 ─────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}>
          {/* Categories Bar Chart (8/12) */}
          <div style={{ gridColumn: 'span 8', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Businesses by Category</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Top 10 categories ranked by listing count</p>
              </div>
            </div>
            <div style={{ padding: '16px 20px', height: 300 }}>
              {loading ? (
                <div style={{ height: '100%', background: 'var(--bg-surface-2)', borderRadius: 12 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoriesData} margin={{ left: -10, right: 0 }}>
                    <defs>
                      <linearGradient id="catGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" height={55} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="url(#catGrad)" name="Businesses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cities Pie Chart (4/12) */}
          <div style={{ gridColumn: 'span 4', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>By City</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Top city distribution</p>
            </div>
            <div style={{ padding: '8px 20px 16px', height: 300 }}>
              {loading ? (
                <div style={{ height: '100%', background: 'var(--bg-surface-2)', borderRadius: 12 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={citiesData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                    >
                      {citiesData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconSize={8}
                      formatter={(v) => <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── CHARTS GRID ROW 2 ─────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}>
          {/* Ratings Distribution (4/12) */}
          <div style={{ gridColumn: 'span 4', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ratings Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>How businesses are rated</p>
            </div>
            <div style={{ padding: '16px 20px', height: 260 }}>
              {loading ? (
                <div style={{ height: '100%', background: 'var(--bg-surface-2)', borderRadius: 12 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingsData} margin={{ left: -15 }}>
                    <defs>
                      <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="url(#ratingGrad)" name="Businesses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* States Treemap (4/12) */}
          <div style={{ gridColumn: 'span 4', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>By State</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>State-wise business distribution</p>
            </div>
            <div style={{ padding: '16px 20px', height: 260 }}>
              {loading ? (
                <div style={{ height: '100%', background: 'var(--bg-surface-2)', borderRadius: 12 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={statesData}
                    dataKey="count"
                    nameKey="name"
                    aspectRatio={4 / 3}
                    content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                      const color = COLORS[index % COLORS.length];
                      return (
                        <g>
                          <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.85} stroke="var(--bg-base)" strokeWidth={2} rx={4} />
                          {width > 50 && height > 25 && (
                            <>
                              <text x={x + width / 2} y={y + height / 2 - 6} fill="white" textAnchor="middle" fontSize={10} fontWeight={700}>
                                {name?.length > 12 ? name.slice(0, 10) + '..' : name}
                              </text>
                              <text x={x + width / 2} y={y + height / 2 + 8} fill="rgba(255,255,255,0.8)" textAnchor="middle" fontSize={9}>
                                {payload?.count}
                              </text>
                            </>
                          )}
                        </g>
                      );
                    }}
                  />
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Registrations (4/12) */}
          <div style={{ gridColumn: 'span 4', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Registrations</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>New businesses over time</p>
            </div>
            <div style={{ padding: '16px 20px', height: 260 }}>
              {loading ? (
                <div style={{ height: '100%', background: 'var(--bg-surface-2)', borderRadius: 12 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ left: -15 }}>
                    <defs>
                      <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fill="url(#monthGrad)"
                      name="Registrations"
                      dot={{ fill: '#4f46e5', r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── TOP BUSINESSES TABLE ──────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Top Rated Businesses</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Highest rated listings with most reviews</p>
            </div>
            <Award size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ padding: '8px 20px 20px' }}>
            <TopBusinessTable data={topBusinesses} loading={loading} />
          </div>
        </div>

        {/* ── SUMMARY STATS ROW ─────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
          padding: '16px 20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
        }}>
          {[
            { label: 'Insurance Services', icon: '🛡️', value: '71', desc: 'Top category' },
            { label: 'Interior Design', icon: '🏠', value: '69', desc: 'Second category' },
            { label: 'Jaipur', icon: '🏰', value: '189', desc: 'Most businesses' },
            { label: 'Rajasthan', icon: '🗺️', value: '189', desc: 'Top state' },
            { label: '5-Star Businesses', icon: '⭐', value: '323', desc: '63% of rated' },
            { label: 'Maharashtra', icon: '🌆', value: '170', desc: 'Second state' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--bg-surface-2)' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{stat.icon}</span>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>{stat.label}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
