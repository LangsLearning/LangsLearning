const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const pino = require('pino');
const expressPino = require('express-pino-logger');
const passport = require('passport');
const cors = require('cors');
const { MongoClient } = require("mongodb");
const uri =
    "mongodb+srv://langslearning:q1w2e3@cluster0.zuiev.mongodb.net/langslearning?retryWrites=true&w=majority";

const mail = require('./contact/mail');

const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });

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
    store: new MongoStore({ client: mongoClient })
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
trialRouter.apply(mongoClient, app);
classesRouter.apply(mongoClient, app);
studentRouter.apply(mongoClient, app);
orderRouter.apply(mongoClient, app);
signinRouter.apply(mongoClient, app);

app.listen(port, () => {
    console.log(`Example app listening at port ${port}`)
});