const webpack = require('webpack');
const path = require('path');
const TransferWebpackPlugin = require('transfer-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const devtool = process.env.NODE_ENV === "production" ? "source-map" : "eval";
const target = process.env.NODE_ENV === "test" ? 'node' : 'web';
let plugins = [];

if(process.env.NODE_ENV === "production") {
	plugins = plugins.concat([
		// Define production build to allow React to strip out unnecessary checks
		new webpack.DefinePlugin({
			'process.env':{
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new webpack.NoEmitOnErrorsPlugin(),
		// Minify the bundle
		new UglifyJSPlugin({
// 			//sourceMap: true, // For debugging purposes only
			parallel: 4,
			uglifyOptions: {
				mangle: true,
				compress: {
					warnings: false, // Suppress uglification warnings
					pure_getters: true,
// 					unsafe: true,
					unsafe_comps: true,
					ie8: false,
					conditionals: true,
					unused: true,
					comparisons: true,
					sequences: true,
					dead_code: true,
					evaluate: true,
					if_return: true,
					join_vars: true,
					drop_debugger: true,
					drop_console: true,
					booleans: true
				},
				output: {
					comments: false,
				},
				exclude: [/\.min\.js$/gi]
			}
		})
	]);
}
else {
	plugins.push(new webpack.HotModuleReplacementPlugin());

	global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	global.XMLHttpRequest.DONE = 4;
}

plugins.push(new TransferWebpackPlugin([ {from: 'www'} ], path.resolve(__dirname, 'src')));

const config = {
	entry: {
		main: [
			'babel-polyfill',
			'./src/app/app.js',
		]
	},
	devServer: {
		contentBase: 'src/www', // Relative directory for base of server
		hot: true, // Live-reload
		inline: true,
		watchContentBase: true,
		port: 3000, // Port Number
		host: '0.0.0.0', // Change to '0.0.0.0' for external facing server
	},
	devtool: devtool,
	target: target,
	output: {
		path: path.resolve(__dirname, 'build'), // Path of output file
		filename: '[name].js', // Name of output file
	},
	plugins: plugins,
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					cacheDirectory: true,
				},
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.(png|jpg|svg|gif)$/,
				loader: "file-loader?name=images/[name].[ext]"
			}
		],
	},
	resolve: {
		modules: ['node_modules', path.resolve('/src')],
		extensions: ['.js'],
		alias: {
			leaflet_css: path.resolve(__dirname, "node_modules/leaflet/dist/leaflet.css"),
			leaflet_marker: path.resolve(__dirname, "node_modules/leaflet/dist/images/marker-icon.png"),
			leaflet_marker_2x: path.resolve(__dirname, "node_modules/leaflet/dist/images/marker-icon-2x.png"),
			leaflet_marker_shadow: path.resolve(__dirname, "node_modules/leaflet/dist/images/marker-shadow.png"),
			leaflet_geocoder_css: path.resolve(__dirname, "node_modules/leaflet-control-geocoder/dist/Control.Geocoder.css"),
			leaflet_geocoder_throbber: path.resolve(__dirname, "node_modules/leaflet-control-geocoder/dist/images/throbber.gif"),
			leaflet_geocoder_icon: path.resolve(__dirname, "node_modules/leaflet-control-geocoder/dist/images/geocoder.png"),
			leaflet_cluster_css: path.resolve(__dirname, "node_modules/react-leaflet-markercluster/dist/styles.min.css")
		}
	}
};

if(process.env.NODE_ENV === "test") {
	config.resolve.alias["browser-request"] = "request";
}

module.exports = config;
