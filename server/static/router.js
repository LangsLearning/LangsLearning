const express = require('express'),
    path = require('path'),
    Router = require('../router');

module.exports = new Router(app => {
    app.engine('.html', require('ejs').__express);

    app.set('views', path.join(__dirname, '../../src/views'));

    app.use(express.static(path.join(__dirname, '../../src')));
    app.use(express.static(path.join(__dirname, '../../node_modules')));

    app.set('view engine', 'html');

    app.get('/', (req, res) => {
        res.render('index', {});
    });

    app.get('/student', (req, res) => {
        res.render('student', {});
    });
});