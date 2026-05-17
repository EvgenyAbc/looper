import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  isProduction,
  sharedFromHost,
  mfExperimentsRemote,
  baseOptimization,
  rspackCssRules,
  rspackCssModuleGenerator,
  rspackCssModuleParser,
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
    uniqueName: '__REMOTE_NAME__',
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
      name: '__REMOTE_NAME__',
      filename: 'remoteEntry.js',
      shareStrategy: 'loaded-first',
      exposes: {
        './App': './src/App.tsx',
        './Widget': './src/Widget.tsx',
      },
      manifest: { fileName: 'mf-manifest.json' },
      dts: { generateTypes: false, consumeTypes: false },
      shared: sharedFromHost,
      experiments: mfExperimentsRemote,
    }),
  ],
  devServer: {
    port: __PORT__,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  optimization: baseOptimization({ remote: true }),
};
