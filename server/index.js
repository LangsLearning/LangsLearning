const express = require('express'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    bodyParser = require('body-parser'),
    expressPino = require('express-pino-logger'),
    logger = require('./logger'),
    expressLogger = expressPino({ logger }),
    passport = require('passport'),
    cors = require('cors'),
    mail = require('./contact/mail'),
    mongoose = require('mongoose'),
    fileUpload = require('express-fileupload'),
    port = process.env.PORT || 3000;

const uri =
    "mongodb+srv://langslearning:q1w2e3@cluster0.zuiev.mongodb.net/langslearning?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(fileUpload({
    createParentPath: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(expressLogger);
app.use(cors());
app.use(cookieParser());
app.use(session({
    secret: "XjVC2sECqsWCUJYF",
    name: "langslearning",
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());

require('./auth')(app);

const routers = [
    require('./class').router,
    require('./class_template').router,
    require('./contact').router,
    require('./order').router,
    require('./signin').router,
    require('./static').router,
    require('./student').router,
    require('./teacher').router,
    require('./trial').router,
];

routers.forEach(route => route.apply(app));

app.listen(port, () => {
    logger.info(`Example app listening at port ${port}`)
});