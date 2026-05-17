import { useEffect, useState } from 'react';

import { looperDebugPageReady } from '@looper/shared';
import {
  UIButton,
  UICard,
  UICardBody,
  UICardHeader,
  UIContainer,
  UIHeading,
  UIInput,
  UISelect,
  UIText,
} from '@looper/shared';

const ROLES = [
  { label: 'Developer', value: 'developer' },
  { label: 'Designer', value: 'designer' },
  { label: 'Product Manager', value: 'pm' },
  { label: 'Admin', value: 'admin' },
];

const TEAMS = [
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'DevOps', value: 'devops' },
  { label: 'Design', value: 'design' },
];

export default function FormPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | number>('');
  const [team, setTeam] = useState<string | number | (string | number)[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    looperDebugPageReady('app4:form');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    console.log('Form submitted:', { name, email, role, team });
  };

  return (
    <div className="page" data-testid="app4-form-page">
      <UIHeading as="h2">{submitted ? 'Submitted!' : 'Create User'}</UIHeading>
      <UIText variant="caption" color="secondary">
        Fill in the form below to create a new team member account.
      </UIText>

      <UIContainer>
        <UICard variant="outlined" style={{ maxWidth: 560, marginTop: 24 }}>
          <UICardHeader>
            <UIHeading as="h3" size="h4">Account Details</UIHeading>
          </UICardHeader>
          <UICardBody>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <UIInput
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <UIInput
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                helper="We'll never share your email."
              />

              <UISelect
                label="Role"
                placeholder="Select a role"
                options={ROLES}
                value={role}
                onChange={(v) => setRole(Array.isArray(v) ? (v[0] ?? '') : v)}
              />

              <UISelect
                label="Teams"
                placeholder="Select teams"
                mode="multiple"
                options={TEAMS}
                value={team}
                onChange={(v) => setTeam(v)}
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <UIButton variant="primary" type="submit" disabled={submitted}>
                  {submitted ? 'Saved ✓' : 'Save'}
                </UIButton>
                <UIButton variant="outline" type="button" onClick={() => {
                  setName(''); setEmail(''); setRole(''); setTeam([]); setSubmitted(false);
                }}>
                  Reset
                </UIButton>
              </div>
            </form>
          </UICardBody>
        </UICard>

        {submitted && (
          <UICard variant="ghost" style={{ maxWidth: 560, marginTop: 16 }}>
            <UICardBody>
              <UIText variant="body" color="success">
                User <strong>{name || '—'}</strong> ({email || '—'}) created successfully!
              </UIText>
            </UICardBody>
          </UICard>
        )}
      </UIContainer>
    </div>
  );
}
