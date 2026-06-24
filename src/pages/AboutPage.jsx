import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, MessageSquare, Zap, Globe, Shield, Users, Star,
  MapPin, ArrowRight, Brain, Heart, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function AboutPage({ toast }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.checkHealth()
      .then(h => setHealth(h))
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }} className="no-scrollbar">

      {/* ─── JAPANESE-STYLE CALM HERO ─────────────────────────────── */}
      <div style={{
        position: 'relative',
        padding: '80px 32px 90px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        textAlign: 'center',
      }}>
        {/* Soft elegant details */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'linear-gradient(90deg, #5a52a3, #a36e52, #4a6b5c)',
        }} />

        {/* Delicate status indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 6,
          background: 'var(--bg-surface-2)',
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: health?.status === 'ok' ? '#4a6b5c' : '#a36e52',
            display: 'inline-block'
          }} />
          Platform: {health?.status === 'ok' ? 'operational' : 'offline'}
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: 16,
          maxWidth: 600,
          margin: '0 auto 16px',
        }}>
          CityHangAround AI
        </h1>
        
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          maxWidth: 520,
          margin: '0 auto 32px',
          lineHeight: 1.7,
          fontWeight: 500,
        }}>
          An elegant local business discovery platform for India. Ask questions in plain language, 
          manage your listing, and connect with customers — all in a single conversation.
        </p>

        {/* Minimal Icon Row */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.25rem' }}>🗣️</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>10+ Languages</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.25rem' }}>🏢</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>500+ Businesses</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>AI-Powered</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '48px 32px', maxWidth: 900, margin: '0 auto' }}>

        {/* ─── OUR MISSION ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>
            The Mission
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            CityHangAround AI was developed by **Honeybee Digitals** to simplify how users find local services 
            and how small merchants represent their shops online. By leveraging conversational artificial intelligence, 
            we remove the barrier of navigating complex menus or keywords.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Users can query the system naturally—like "where can I get my car serviced in Pune" or "scrap dealers nearby"—and 
            our AI converts this context instantly to lookup real database items, rendering clean citations, map details, and product catalogs.
          </p>
        </div>

        {/* ─── KEY CAPABILITIES (Japanese Grid) ────────────────────────── */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.01em' }}>
            Core Capabilities
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16
          }}>
            {[
              {
                icon: <Brain size={18} />,
                title: 'Natural Language Search',
                desc: 'Supports contextual queries across English, Hindi, Gujarati, Tamil, and more without strict formats.',
                color: '#5a52a3'
              },
              {
                icon: <Building2 size={18} />,
                title: 'Merchant Dashboard',
                desc: 'Add and claim business profiles, upload catalog products, and launch active discount deals via simple chat.',
                color: '#4a6b5c'
              },
              {
                icon: <Globe size={18} />,
                title: 'Localized Databases',
                desc: 'Connected to direct SQLite databases featuring structured details of businesses, pricing, and locations.',
                color: '#a36e52'
              },
              {
                icon: <Shield size={18} />,
                title: 'Secure OTP Checks',
                desc: 'Direct authentication via Phone OTP and Email verification to claim ownership and manage profiles securely.',
                color: '#3f5a6b'
              }
            ].map((cap, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: 20,
                  transition: 'all 200ms ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = cap.color;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${cap.color}08`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `${cap.color}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: cap.color,
                  marginBottom: 14
                }}>
                  {cap.icon}
                </div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {cap.title}
                </h3>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── FAQ / HOW TO USE (Japanese Minimal Accordion Style) ─────── */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.01em' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                q: 'How do I search for businesses?',
                a: 'Simply ask the chatbot in natural language. For example: "Are there any scrap dealers in Jaipur?" or "Find salons in Mumbai". The bot will parse your location and category and display results.'
              },
              {
                q: 'How can I add my own business listing?',
                a: 'Open the chatbot and say "add my business" or click "Add Business" from the actions menu. The AI will guide you step-by-step through entering your phone, name, category, address, and city.'
              },
              {
                q: 'How do I verify and update my listing?',
                a: 'If your business is already listed, click "Claim Business" or log in with your phone or email. You will receive an OTP code to verify ownership. Once verified, you can update details, list catalog products, and create custom discount deals.'
              },
              {
                q: 'Which languages are supported?',
                a: 'We support English, Hindi (हिंदी), Gujarati (ગુજરાતી), Tamil (தமிழ்), and Telugu (తెలుగు). You can switch languages at any time using the globe selector at the top of the chat panel.'
              }
            ].map((faq, i) => (
              <div 
                key={i} 
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '16px 20px'
                }}
              >
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  margin: '0 0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <HelpCircle size={14} style={{ color: 'var(--color-primary)' }} />
                  {faq.q}
                </h4>
                <p style={{ 
                  fontSize: '0.8125rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.6, 
                  margin: 0,
                  paddingLeft: 22
                }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CTA ───────────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '36px 24px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Begin Your Local Search
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
            Access our local directory database conversing in your native language. Find top rated shops or update your merchant profile.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/chat"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', background: 'var(--color-primary)', color: 'white',
                borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
                textDecoration: 'none', transition: 'all 200ms ease',
                boxShadow: 'var(--shadow-primary)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
            >
              <MessageSquare size={14} /> Start Chatting
            </Link>
            <Link
              to="/categories"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', background: 'var(--bg-surface-2)', color: 'var(--text-primary)',
                borderRadius: 8, fontWeight: 700, fontSize: '0.8125rem',
                textDecoration: 'none', transition: 'all 200ms ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--border-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
            >
              Browse Categories <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 32px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.75rem',
      }}>
        <p>
          Built with <Heart size={10} style={{ display: 'inline', color: 'var(--color-primary)', marginBottom: -1 }} /> by{' '}
          <strong style={{ color: 'var(--color-primary)' }}>Honeybee Digitals</strong>
          {' '}· CityHangAround AI
        </p>
      </footer>
    </div>
  );
}
