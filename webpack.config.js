const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
	devServer: {
		port: 4000,
		historyApiFallback: true,
	},
	entry: {
		home: './pages/home/index.js',
		about: './pages/about/index.js',
		resources: './pages/resources/index.js',
		'ai-voicer': './pages/ai-voicer/index.js',
		'ai-avatar': './pages/ai-avatar/index.js',
		'ai-eye': './pages/ai-eye/index.js',
		'ai-compress': './pages/ai-compress/index.js',
	},
	output: {
		path: path.join(__dirname, '/build'),
		filename: '[name].min.js',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: './index.html',
		}),
	],
	devtool: 'source-map',
}
