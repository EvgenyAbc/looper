import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { dirname,resolve } from 'path';
import { fileURLToPath } from 'url';

import {
  baseOptimization,
  isProduction,
  mfExperimentsRemote,
  rspackCssModuleGenerator,
  rspackCssModuleParser,
  rspackCssRules,
  sharedFromHost,
  swcTsxHost,
} from '../../rspack.shared.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'source-map',
  entry: {},
  output: {
    path: resolve(__dirname, 'dist'),
    publicPath: 'auto',
    uniqueName: 'app2',
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
    new ModuleFederationPlugin({
      name: 'app2',
      filename: 'remoteEntry.js',
      shareStrategy: 'loaded-first',
      exposes: {
        './App': './src/App.tsx',
      },
      manifest: { fileName: 'mf-manifest.json' },
      dts: { generateTypes: false, consumeTypes: false },
      shared: sharedFromHost,
      experiments: mfExperimentsRemote,
    }),
  ],
  devServer: {
    port: 3003,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  optimization: baseOptimization({ remote: true }),
};
