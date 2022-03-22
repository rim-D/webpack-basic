const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

// 배포(production) || 개발(development)
// 배포모드와 개발모드의 코드를 다르게 번들링하고 실행 가능

// React의 개발 모드는 버그로 이어질만한 많은 부분을 미리 경고해주는 검증 코드가 포함되어 있음
// 이런 코드는 번들 크기를 증가시키고 앱 속도를 느리게 할 수 있음

// 배포모드에서는 검증코드는 포함하지 않고 배포한다 

// process.env.NODE_ENV  Node.js기반에서의 대표적인 환경변수
const webpackMode = process.env.NODE_ENV || 'development';

module.exports = {
	mode: webpackMode,
	entry: { // 자바스크립트를 bulid시 시작점
		main: './src/main.js',
	},
	output: {
		path: path.resolve('./dist'), // bulid했을 때 경로설정
		filename: '[name].min.js' // bulid 시 파일명 
	},
	// es5로 빌드 해야 할 경우 주석 제거
	// 단, 이거 설정하면 webpack-dev-server 3번대 버전에서 live reloading 동작 안함
	// target: ['web', 'es5'],
	devServer: {
		liveReload: true, // 자동 새로 고침 설정
		// publicPath: '/dist/',
		// compress: true,
		// port: 9000,
		// hot: true,
	},
	optimization: {
		minimizer: webpackMode === 'production' ? [
			new TerserPlugin({ // bulid시 소스 코드 압축
				terserOptions: {
					compress: {
						drop_console: true // 테스트로 console로 값을 찍어보는 것들을 자동 삭제하여 bulid가능
					}
				}
			})
		] : [],
		splitChunks: {
			chunks: 'all'
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.js$/,
				enforce: 'pre',
				use: ['source-map-loader'],
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			minify: process.env.NODE_ENV === 'production' ? {
				collapseWhitespace: true,
				removeComments: true,
			} : false
		}),
		new CleanWebpackPlugin(),
		// CopyWebpackPlugin: 그대로 복사할 파일들을 설정하는 플러그인
		// 아래 patterns에 설정한 파일/폴더는 빌드 시 dist 폴더에 자동으로 생성됩니다.
		// patterns에 설정한 경로에 해당 파일이 없으면 에러가 발생합니다.
		// 사용하는 파일이나 폴더 이름이 다르다면 변경해주세요.
		// 그대로 사용할 파일들이 없다면 CopyWebpackPlugin을 통째로 주석 처리 해주세요.
		new CopyWebpackPlugin({
			patterns: [
				{ from: "./src/main.css", to: "./chuckmain.css" }, // build시 파일명 변경 가능
				{ from: "./src/images", to: "./images" },
			],
		})
	]
};
