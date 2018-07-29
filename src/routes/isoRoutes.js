import express from 'express';
import sqlite3 from 'sqlite3';

const dba = require('../js/dbFunc');

const db = new sqlite3.Database('./db/testing.db');

const isoRouter = express.Router();

isoRouter.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/auth/signIn');
  }
});

isoRouter.route('/list')
  .get((req, res) => {
    db.all('SELECT rowid, * From isoTracker', (err, rows) => {
      if (err) throw err;
      res.render('./iso/list', { rows, user: req.user });
    });
  });

isoRouter.route('/iso/:id')
  .get((req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM isoTracker WHERE rowid = ${id}`, (err, row) => {
      if (!row) {
        res.redirect('/404');
      } else res.render('./iso/detail', { row, user: req.user });
    });
  });

isoRouter.route('/Add')
  .get((req, res) => {
    res.render('./iso/add', { user: req.user });
  })
  .post((req, res) => {
    dba.insertISONotification(req.body, (err, message) => {
      if (err) res.end(err);
      res.end(message);
    });
  });

module.exports = isoRouter;
