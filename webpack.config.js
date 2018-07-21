const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = [{
  entry: {
    SemViz: './src/SemViz.js'
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {}
      }
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: 'src/index.html'
    }),
    new CopyWebpackPlugin([{
        from: 'src/config/',
        to: 'config/[name].[ext]',
        toType: 'template'
      },
      {
        from: 'src/WebComponentLink/',
        to: 'WebComponentLink/[name].[ext]',
        toType: 'template'
      },
    ], {})
  ]
},{
  entry: {
    httpFetch: './src/httpFetch/httpFetch.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/httpFetch')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {}
      }
    }]
  },
  plugins: []
},{
  entry: {
    PostalMessaging: './src/PostalMessaging/PostalMessaging.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/PostalMessaging')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {}
      }
    }]
  },
  plugins: []
},{
  entry: {
    navigoRouter: './src/navigoRouter/navigoRouter.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/navigoRouter')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {}
      }
    }]
  },
  plugins: []
}];
