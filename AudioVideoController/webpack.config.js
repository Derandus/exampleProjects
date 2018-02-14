/**
 * Created by Lukas on 07.06.2017.
 */
"use strict";
let path = require('path');

module.exports = {
    entry: './public/index.js',
    output: {
        filename: './bundle.js',
        path: path.resolve(__dirname, 'dist'),
    }

};