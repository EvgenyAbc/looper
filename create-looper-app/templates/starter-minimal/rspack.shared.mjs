/** @typedef {import('@module-federation/enhanced/rspack').Shared} Shared */

/**
 * Разрешает `import styles from '*.module.css'` (default) вместе с named/namespace импортами.
 * @returns {Record<string, Record<string, boolean>>}
 */
export function rspackCssModuleParser() {
  return {
    'css/module': {
      namedExports: false,
    },
  };
}

/**
 * Options for `module.generator['css/module']` — stable scoped class names per MF container (`output.uniqueName`).
 * @returns {Record<string, Record<string, string | boolean>>}
 */
export function rspackCssModuleGenerator() {
  return {
    'css/module': {
      esModule: true,
      exportsConvention: 'as-is',
      localIdentName: '[uniqueName]-[name]__[local]',
    },
  };
}

/**
 * Global CSS vs CSS Modules: `*.module.css` → `css/module`, остальное `.css` → `css`.
 * @returns {import('@rspack/core').RuleSetRule[]}
 */
export function rspackCssRules() {
  return [
    {
      test: /\.module\.css$/i,
      type: 'css/module',
    },
    {
      test: /\.css$/i,
      exclude: /\.module\.css$/i,
      type: 'css',
    },
  ];
}

export const isProduction = process.env.NODE_ENV === 'production';

const reactSharedVersion = '^19.0.0';

/**
 * Host + MF remotes: automatic JSX → `react/jsx-dev-runtime` via Module Federation `shared`
 * (`import: false` on remotes, `eager: true` on shell). Do not use classic JSX on remotes.
 */
export const swcTsxHost = {
  test: /\.tsx?$/,
  use: {
    loader: 'builtin:swc-loader',
    options: {
      jsc: {
        parser: { syntax: 'typescript', tsx: true },
        transform: { react: { runtime: 'automatic' } },
      },
    },
  },
};

/** @deprecated Use {@link swcTsxHost} — remotes share jsx-runtime from the shell. */
export const swcTsxRemote = swcTsxHost;

/** Remotes: host provides these; do not bundle fallback copies. */
export const sharedFromHost = {
  react: { singleton: true, requiredVersion: reactSharedVersion, import: false },
  'react-dom': { singleton: true, requiredVersion: reactSharedVersion, import: false },
  'react/jsx-runtime': { singleton: true, requiredVersion: reactSharedVersion, import: false },
  'react/jsx-dev-runtime': { singleton: true, requiredVersion: reactSharedVersion, import: false },
  'react-router': { singleton: true, requiredVersion: '^7.0.0', import: false },
  '@looper/shared': { singleton: true, import: false },
};

/** Shell host: eager singletons for sync boot + context sharing. */
export const sharedEagerHost = {
  react: { singleton: true, requiredVersion: reactSharedVersion, eager: true },
  'react-dom': { singleton: true, requiredVersion: reactSharedVersion, eager: true },
  'react/jsx-runtime': { singleton: true, requiredVersion: reactSharedVersion, eager: true },
  'react/jsx-dev-runtime': { singleton: true, requiredVersion: reactSharedVersion, eager: true },
  'react-router': { singleton: true, requiredVersion: '^7.0.0', eager: true },
  '@looper/shared': { singleton: true, eager: true },
};

/** Shell: inject runtime-core once; remotes use `externalRuntime`. */
export const mfExperimentsHost = {
  provideExternalRuntime: true,
  optimization: { target: 'web' },
};

/** Remotes: thin remoteEntry; read runtime-core from host global. */
export const mfExperimentsRemote = {
  externalRuntime: true,
  optimization: { target: 'web', disableSnapshot: true },
};

const reactVendorExclude =
  /[\\/]node_modules[\\/](react|react-dom|react-router|scheduler|react-is|react-refresh|react-jsx-runtime|react-jsx-dev-runtime)([\\/]|$)/;

export const vendorSplitChunks = {
  chunks: 'all',
  cacheGroups: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendor',
      chunks: 'all',
      priority: 20,
    },
    default: {
      minChunks: 2,
      priority: -20,
      reuseExistingChunk: true,
    },
  },
};

/** MF remotes: never put React / jsx-runtime into `vendor.js` (breaks host singleton). */
export const remoteSplitChunks = {
  chunks: 'all',
  cacheGroups: {
    vendor: {
      test: (module) => {
        const resource = module.nameForCondition?.() ?? module.resource ?? '';
        return /[\\/]node_modules[\\/]/.test(resource) && !reactVendorExclude.test(resource);
      },
      name: 'vendor',
      chunks: 'all',
      priority: 20,
    },
    default: {
      minChunks: 2,
      priority: -20,
      reuseExistingChunk: true,
    },
  },
};

/** Host-only: named vendor chunks for cache + size visibility (MF shared stay eager). */
export const shellSplitChunks = {
  chunks: 'all',
  cacheGroups: {
    react: {
      name: 'react',
      chunks: 'all',
      priority: 40,
      test: /[\\/]node_modules[\\/](react|scheduler|react-jsx-runtime|react-jsx-dev-runtime)([\\/]|$)/,
    },
    reactDom: {
      name: 'react-dom',
      chunks: 'all',
      priority: 38,
      test: /[\\/]node_modules[\\/]react-dom([\\/]|$)/,
    },
    reactRouter: {
      name: 'react-router',
      chunks: 'all',
      priority: 36,
      test: /[\\/]node_modules[\\/](react-router|cookie|set-cookie-parser)([\\/]|$)/,
    },
    mfRuntime: {
      name: 'mf-runtime',
      chunks: 'all',
      priority: 34,
      test: /[\\/]node_modules[\\/]@module-federation([\\/]|$)/,
    },
    vendor: {
      name: 'vendor',
      chunks: 'all',
      priority: 20,
      test: /[\\/]node_modules[\\/]/,
    },
    default: {
      minChunks: 2,
      priority: -20,
      reuseExistingChunk: true,
    },
  },
};

/**
 * @param {{ remote?: boolean; shell?: boolean }} [options]
 */
export function baseOptimization(options = {}) {
  const { remote = false, shell = false } = options;
  const splitChunks = shell ? shellSplitChunks : remote ? remoteSplitChunks : vendorSplitChunks;
  return {
    sideEffects: true,
    usedExports: true,
    providedExports: true,
    innerGraph: true,
    concatenateModules: remote ? false : isProduction ? false : true,
    mangleExports: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    splitChunks,
  };
}
