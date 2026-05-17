import { readFileSync } from 'fs';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { CopyRspackPlugin, HtmlRspackPlugin } from '@rspack/core';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { buildCspPolicy } from '../../scripts/csp.mjs';

import {
  baseOptimization,
  isProduction,
  mfExperimentsHost,
  rspackCssModuleGenerator,
  rspackCssModuleParser,
  rspackCssRules,
  sharedEagerHost,
  swcTsxHost,
} from '../../rspack.shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const menuJson = readFileSync(resolve(__dirname, 'public/mock-menu.json'), 'utf8');
const cspExtra = (process.env.CSP_EXTRA_ORIGINS ?? '').split(/[\s,]+/).filter(Boolean);
const { headerName: cspHeaderName, policy: cspPolicy } = buildCspPolicy(menuJson, {
  enforce: false,
  extraOrigins: cspExtra,
});

export default {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',
  entry: './src/bootstrap.tsx',
  output: {
    path: resolve(__dirname, 'dist'),
    /** Dev: absolute `/` so deep splat URLs (F5 on `/app2/app4/page-b`) load chunks from origin root. */
    publicPath: isProduction ? 'auto' : '/',
    uniqueName: 'shell',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    parser: rspackCssModuleParser(),
    generator: rspackCssModuleGenerator(),
    rules: [
      ...rspackCssRules(),
      swcTsxHost,
    ],
  },
  plugins: [
    new HtmlRspackPlugin({ template: './src/index.html', publicPath: '/' }),
    new CopyRspackPlugin({
      patterns: [{ from: resolve(__dirname, 'public'), to: '.' }],
    }),
    new ModuleFederationPlugin({
      name: 'shell',
      shareStrategy: 'loaded-first',
      shared: sharedEagerHost,
      experiments: mfExperimentsHost,
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: {
      index: '/index.html',
      // Do not serve index.html for /favicon.ico (avoids refetch loop when icon is missing)
      disableDotRule: true,
    },
    static: {
      directory: resolve(__dirname, 'public'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      [cspHeaderName]: cspPolicy,
    },
  },
  optimization: baseOptimization({ shell: true }),
  /**
   * Host entrypoint intentionally includes eager shared singletons + MF runtime
   * (see sharedEagerHost); ~500 KiB is normal. Default 512 KiB webpack limit is too tight.
   */
  performance: {
    hints: 'warning',
    maxEntrypointSize: 768 * 1024,
    maxAssetSize: 512 * 1024,
  },
};
