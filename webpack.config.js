const path = require('path')
// const HtmlWebpackPlugin = require('html-webpack-plugin')

const commonConfig = {
  target: 'electron-main',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  node: {
    // Not certain if this is needed
    // __dirname: false
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.tsx?$/,
        loader: ['babel-loader', 'ts-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'standard-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      },
      {
        test: /tar[\\/].*\.js$/,
        loader: ['babel-loader', 'octal-number-loader']
      },
      {
        test: /rc[\\/].*\.js$/,
        loaders: ['babel-loader', 'shebang-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
  }
}

module.exports = [
  Object.assign(
    {
      target: 'electron-main',
      entry: { main: './src/main.ts' }
    },
    commonConfig)
  // Object.assign(
  //   {
  //     target: 'electron-renderer',
  //     entry: { gui: './src/gui.ts' },
  //     plugins: [new HtmlWebpackPlugin()]
  //   },
  //   commonConfig)
]
