import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { looperDebugPageReady } from '@looper/shared';
import {
  UIBadge,
  UIButton,
  UICard,
  UICardBody,
  UICardFooter,
  UICardHeader,
  UIContainer,
  UIHeading,
  UIInput,
  UISelect,
  UISpinner,
  UITag,
  UIText,
  UITooltip,
} from '@looper/shared';

export default function ComponentsShowcase() {
  const [selectVal, setSelectVal] = useState<string | number>('');

  useEffect(() => {
    looperDebugPageReady('app4:components');
  }, []);

  return (
    <div className="page" data-testid="app4-components">
      <UIHeading as="h1">Components</UIHeading>
      <UIText variant="caption" color="secondary">
        Все компоненты @ui-looper/core в одном месте.
      </UIText>

      <UIContainer>
        {/* ── Button ── */}
        <Section title="Button">
          <div className="ui-kit-row">
            <UIButton variant="primary">Primary</UIButton>
            <UIButton variant="secondary">Secondary</UIButton>
            <UIButton variant="outline">Outline</UIButton>
            <UIButton variant="ghost">Ghost</UIButton>
            <UIButton variant="danger">Danger</UIButton>
          </div>
          <div className="ui-kit-row" style={{ marginTop: 8 }}>
            <UIButton variant="primary" size="sm">Small</UIButton>
            <UIButton variant="primary">Medium</UIButton>
            <UIButton variant="primary" size="lg">Large</UIButton>
            <UIButton variant="primary" loading>Loading</UIButton>
            <UIButton variant="primary" disabled>Disabled</UIButton>
          </div>
        </Section>

        {/* ── Badge ── */}
        <Section title="Badge">
          <div className="ui-kit-row">
            <UIBadge variant="primary" count={3}>Inbox</UIBadge>
            <UIBadge variant="danger" count={7}>Alerts</UIBadge>
            <UIBadge variant="success" mode="dot" standalone />
            <UIBadge variant="accent" mode="text" text="NEW" standalone />
            <UIBadge variant="warning" mode="count" count={99} maxCount={99}>Notifications</UIBadge>
          </div>
        </Section>

        {/* ── Tag ── */}
        <Section title="Tag">
          <div className="ui-kit-row">
            <UITag variant="default">Default</UITag>
            <UITag variant="primary">Primary</UITag>
            <UITag variant="accent">Accent</UITag>
            <UITag variant="success">Success</UITag>
            <UITag variant="warning">Warning</UITag>
            <UITag variant="danger">Danger</UITag>
            <UITag variant="primary" onClose={() => {}}>Closable</UITag>
          </div>
        </Section>

        {/* ── Card ── */}
        <Section title="Card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <UICard variant="default">
              <UICardHeader><UIHeading as="h3" size="h4">Default Card</UIHeading></UICardHeader>
              <UICardBody>Default card with header, body and footer.</UICardBody>
              <UICardFooter><UIButton variant="primary" size="sm">Action</UIButton></UICardFooter>
            </UICard>
            <UICard variant="outlined">
              <UICardBody>Outlined card — just a body section with no padding.</UICardBody>
            </UICard>
          </div>
        </Section>

        {/* ── Input ── */}
        <Section title="Input">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <UIInput placeholder="Default input" />
            <UIInput label="With label" placeholder="Type something…" />
            <UIInput label="With error" status="error" helper="This field is required" placeholder="Bad value" />
            <UIInput label="With prefix" prefix="🔍" placeholder="Search…" />
          </div>
        </Section>

        {/* ── Select ── */}
        <Section title="Select">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <UISelect
              placeholder="Pick an option"
              options={[
                { label: 'Option A', value: 'a' },
                { label: 'Option B', value: 'b' },
                { label: 'Option C', value: 'c' },
              ]}
              value={selectVal}
              onChange={(v) => setSelectVal(Array.isArray(v) ? (v[0] ?? '') : v)}
            />
            <UISelect
              label="Multi-select"
              mode="multiple"
              placeholder="Choose tags"
              options={[
                { label: 'React', value: 'react' },
                { label: 'Vue', value: 'vue' },
                { label: 'Svelte', value: 'svelte' },
              ]}
            />
          </div>
        </Section>

        {/* ── Spinner ── */}
        <Section title="Spinner">
          <div className="ui-kit-row">
            <UISpinner size="sm" />
            <UISpinner size="md" />
            <UISpinner size="lg" />
            <UISpinner variant="accent" />
            <UISpinner variant="primary" label="Custom label…" />
          </div>
        </Section>

        {/* ── Tooltip ── */}
        <Section title="Tooltip">
          <div className="ui-kit-row">
            <UITooltip title="I'm on top!" placement="top">
              <UIButton variant="outline" size="sm">Hover top</UIButton>
            </UITooltip>
            <UITooltip title="I'm on the right" placement="right">
              <UIButton variant="outline" size="sm">Hover right</UIButton>
            </UITooltip>
            <UITooltip title="I'm on the bottom" placement="bottom" arrow>
              <UIButton variant="outline" size="sm">Hover bottom</UIButton>
            </UITooltip>
          </div>
        </Section>

        {/* ── Typography ── */}
        <Section title="Typography">
          <UIHeading as="h1">Heading h1</UIHeading>
          <UIHeading as="h2">Heading h2</UIHeading>
          <UIHeading as="h3">Heading h3</UIHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            <UIText>Default body text</UIText>
            <UIText variant="caption" color="secondary">Caption secondary text</UIText>
            <UIText variant="label" weight="semibold">Label semibold</UIText>
            <UIText variant="help">Help / hint text</UIText>
            <UIText variant="error">Error text</UIText>
          </div>
        </Section>
      </UIContainer>
    </div>
  );
}

/* ── Section helper ── */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <UICard variant="outlined" style={{ marginTop: 24 }}>
      <UICardHeader>
        <UIHeading as="h2" size="h4">{title}</UIHeading>
      </UICardHeader>
      <UICardBody>{children}</UICardBody>
    </UICard>
  );
}
