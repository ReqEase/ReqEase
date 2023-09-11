// noinspection WebpackConfigHighlighting

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require("webpack");

// noinspection JSUnresolvedReference
let bannerPlugin = new webpack.BannerPlugin({
    banner: `/*!
 * ReqEase v1.2.3
 * (c) HichemTech
 * Released under the MIT License.
 * Github: github.com/ReqEase/ReqEase
 */
`,
    raw: true,
});

let module_ = {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
    ],
};

module.exports = [
    {
        mode: 'production',
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'reqease.js',
        },
        optimization: {
            minimize: false,
        },
        plugins: [
            bannerPlugin
        ],
        module: module_,
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
    },
    {
        mode: 'production',
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'reqease.min.js',
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ],
        },
        plugins: [
            new TerserPlugin({
                extractComments: false,
            }),
            bannerPlugin
        ],
        module: module_,
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
    },
];