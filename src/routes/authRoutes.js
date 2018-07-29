import express from 'express';
import passport from 'passport';

const authRouter = express.Router();

authRouter.route('/signIn')
  .get((req, res) => {
    res.render('signIn');
  })
  .post(passport.authenticate('local', {
    successRedirect: '/beta/home',
    failureRedirect: '/auth/signIn',
  }));

module.exports = authRouter;
