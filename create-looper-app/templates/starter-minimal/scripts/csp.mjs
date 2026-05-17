/**
 * Build a simple shell CSP policy from mock-menu.json MF entry URLs.
 */
import { readFileSync } from 'fs';

/**
 * @param {string} menuJson
 * @param {{ enforce?: boolean; extraOrigins?: string[] }} [options]
 */
export function buildCspPolicy(menuJson, options = {}) {
  const { enforce = false, extraOrigins = [] } = options;
  const menu = JSON.parse(menuJson);
  const origins = new Set();

  for (const app of [...(menu.apps ?? []), ...(menu.system ?? [])]) {
    if (!app?.entry) continue;
    try {
      origins.add(new URL(app.entry).origin);
    } catch {
      /* ignore invalid entry */
    }
  }

  for (const origin of extraOrigins) {
    const trimmed = origin.trim();
    if (trimmed) origins.add(trimmed);
  }

  const mf = [...origins].join(' ');
  const scriptSrc = [
    "'self'",
    mf,
    "'unsafe-inline'",
    ...(enforce ? [] : ["'unsafe-eval'"]),
  ]
    .filter(Boolean)
    .join(' ');

  const policy = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    `connect-src 'self' ${mf}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join('; ');

  const headerName = enforce
    ? 'Content-Security-Policy'
    : 'Content-Security-Policy-Report-Only';

  return { headerName, policy, headerLine: `${headerName}: ${policy}` };
}

/**
 * @param {string} menuPath
 * @param {{ enforce?: boolean; extraOrigins?: string[] }} [options]
 */
export function buildCspPolicyFromFile(menuPath, options = {}) {
  return buildCspPolicy(readFileSync(menuPath, 'utf8'), options);
}
