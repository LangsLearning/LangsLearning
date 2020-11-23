const express = require('express');
const path = require('path');

module.exports = {
    apply: (app) => {
        app.engine('.html', require('ejs').__express);

        app.set('views', path.join(__dirname, '../../src/views'));

        app.use(express.static(path.join(__dirname, '../../src')));
        app.use(express.static(path.join(__dirname, '../../node_modules')));

        app.set('view engine', 'html');

        app.get('/', function (req, res) {
            res.render('index', {});
        });
    }
};