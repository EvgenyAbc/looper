import type { Shared } from '@module-federation/enhanced/rspack';
import type { RuleSetRule } from '@rspack/core';

export function rspackCssModuleParser(): Record<string, Record<string, boolean>>;
export function rspackCssModuleGenerator(): Record<string, Record<string, string | boolean>>;
export function rspackCssRules(): RuleSetRule[];
export const isProduction: boolean;
export const sharedFromHost: Shared;
export const sharedEagerHost: Shared;
export const mfExperimentsHost: Record<string, unknown>;
export const mfExperimentsRemote: Record<string, unknown>;
export const swcTsxHost: import('@rspack/core').RuleSetRule;
/** @deprecated Use {@link swcTsxHost}. */
export const swcTsxRemote: import('@rspack/core').RuleSetRule;
export function baseOptimization(options?: {
  remote?: boolean;
  shell?: boolean;
}): Record<string, unknown>;
