import 'babel-register';
import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import chalk from 'chalk';
import morgan from 'morgan';

require('dotenv').config();

const debug = require('debug')('app');
const authRouter = require('./src/routes/authRoutes');
const betaRouter = require('./src/routes/beta');
const eventRouter = require('./src/routes/eventRoutes');
const isoRouter = require('./src/routes/isoRoutes');
const dba = require('./src/js/dbFunc');

// const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: process.env.secret, resave: false, saveUninitialized: false }));

require('./src/config/passport')(app);

app.use(express.static('public/'));
app.use(morgan('tiny'));
app.use('/auth', authRouter);
app.use('/beta', betaRouter);
app.use('/events', eventRouter);
app.use('/iso', isoRouter);

dba.createTables();

app.set('views', 'src/views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('comingSoon');
});

app.get('/404', (req, res) => {
  res.render('404');
});

// app.listen(port, (err) => {
//   debug(`running on server port ${chalk.green(port)}`);
//   if (err) {
//     debug(`Error has accured ${err}`);
//   }
// });

module.exports = app;
