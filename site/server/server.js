const express = require('express');
const app = express();
const path = require('path');
const port = 3000;

app.engine('.html', require('ejs').__express);

// Optional since express defaults to CWD/views

app.set('views', path.join(__dirname, '../src/views'));

// Path to our public directory

app.use(express.static(path.join(__dirname, '../src')));
app.use(express.static(path.join(__dirname, '../node_modules')));

app.set('view engine', 'html');

const users = [
    { name: 'tobi', email: 'tobi@learnboost.com' },
    { name: 'loki', email: 'loki@learnboost.com' },
    { name: 'jane', email: 'jane@learnboost.com' }
];

app.get('/', function (req, res) {
    res.render('index', {
        users: users,
        title: "EJS example",
        header: "Some users"
    });
});

app.listen(3000);