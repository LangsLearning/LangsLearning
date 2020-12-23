const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const pino = require('pino');
const expressPino = require('express-pino-logger');
const passport = require('passport');
const cors = require('cors');

const uri =
    "mongodb+srv://langslearning:q1w2e3@cluster0.zuiev.mongodb.net/langslearning?retryWrites=true&w=majority";

const mongoose = require('mongoose');
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const mail = require('./contact/mail');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

const app = express();
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

const port = process.env.PORT || 3000;
const contactRouter = require('./contact/router');
const staticRouter = require('./static/router');
const authRouter = require('./auth/router');
const trialRouter = require('./trial/router');
const classesRouter = require('./classes/router');
const studentRouter = require('./student/router');
const orderRouter = require('./orders/router');
const signinRouter = require('./signin/router');

contactRouter.apply(app);
staticRouter.apply(app);
authRouter.apply(app);
trialRouter.apply(app);
classesRouter.apply(app);
studentRouter.apply(app);
orderRouter.apply(app);
signinRouter.apply(app);

app.listen(port, () => {
    logger.info(`Example app listening at port ${port}`)
});