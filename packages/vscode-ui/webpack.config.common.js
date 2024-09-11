// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line no-undef
const CopyPlugin = require('copy-webpack-plugin');

// add CopyPlugin to the plugins array

module.exports = {
  mode: 'development',
  entry: './src/index.tsx', // Entry point for TypeScript compilation
  output: {
    filename: 'index.js', // Output filename
    path: path.resolve(__dirname, 'build'), // Output directory
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public/index.html', to: 'index.html' },
        { from: 'public/style.css', to: 'style.css' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: false, // none prod
  },
  devtool: 'eval-source-map',
};

