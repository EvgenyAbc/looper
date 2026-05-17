import { useEffect, useState } from 'react';

import { looperDebugPageReady } from '@looper/shared';
import {
  UIBadge,
  UICard,
  UICardBody,
  UICardHeader,
  UIContainer,
  UIHeading,
  UISpinner,
  UITag,
  UIText,
} from '@looper/shared';

/* ── Mock data ── */

const STATS = [
  { label: 'Active Users', value: '2,847', variant: 'primary' as const },
  { label: 'Orders', value: '156', variant: 'success' as const },
  { label: 'Pending', value: '23', variant: 'warning' as const },
  { label: 'Issues', value: '7', variant: 'danger' as const },
];

const RECENT_ITEMS = [
  { id: 1, title: 'Project Alpha', tag: 'active', tagVariant: 'success' as const },
  { id: 2, title: 'Design System v2', tag: 'in review', tagVariant: 'warning' as const },
  { id: 3, title: 'API Integration', tag: 'active', tagVariant: 'success' as const },
  { id: 4, title: 'Legacy Migration', tag: 'draft', tagVariant: 'default' as const },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    looperDebugPageReady('app4:dashboard');
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="page" data-testid="app4-dashboard">
      <UIHeading as="h1">Dashboard</UIHeading>
      <UIText variant="caption" color="secondary">
        Overview of key metrics and recent activity.
      </UIText>

      <UIContainer>
        {/* ── Stats cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 24 }}>
          {STATS.map((stat) => (
            <UICard key={stat.label} variant="outlined">
              <UICardBody style={{ textAlign: 'center', padding: '1.25rem' } as React.CSSProperties}>
                <UIText variant="caption" color="secondary">{stat.label}</UIText>
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0' }}>
                  {loading ? <UISpinner size="sm" /> : stat.value}
                </div>
                <UIBadge variant={stat.variant} mode="dot" standalone />
              </UICardBody>
            </UICard>
          ))}
        </div>

        {/* ── Recent items ── */}
        <UICard variant="outlined" style={{ marginTop: 24 }}>
          <UICardHeader>
            <UIHeading as="h3" size="h4">Recent Projects</UIHeading>
          </UICardHeader>
          <UICardBody>
            {RECENT_ITEMS.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--uil-border, #e5e7eb)',
                }}
              >
                <UIText>{item.title}</UIText>
                <UITag variant={item.tagVariant} size="sm">{item.tag}</UITag>
              </div>
            ))}
          </UICardBody>
        </UICard>

        {/* ── Loading state example ── */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <UISpinner size="sm" />
            <UIText variant="caption" color="secondary">Loading dashboard data…</UIText>
          </div>
        )}
      </UIContainer>
    </div>
  );
}
