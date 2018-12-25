import express from 'express';

const dbFunc = require('../js/dbFunc');

const betaRouter = express.Router();
// betaRouter.use((req, res, next) => {
//   if (req.user) {
//     next();
//   } else {
//     res.redirect('/auth/signIn');
//   }
// });

betaRouter.route('/')
  .get((req, res) => {
    res.render('comingSoon');
  });

betaRouter.route('/home')
  .get((req, res) => {
    dbFunc.dashboard()
      .then((data) => {
        res.render('index', { data, user: req.user });
      });
  });

betaRouter.route('/schat')
  .get((req, res) => {
    dbFunc.dashboard()
      .then((data) => {
        res.render('schat', { data, user: req.user });
      });
  });

module.exports = betaRouter;
