import sqlite3 from 'sqlite3';
import request from 'axios';

require('dotenv').config();

const findPrevious = require('../js/webservices');
const create = require('../js/ticketCreator');
const dbFunc = require('../js/dbFunc');


const db = new sqlite3.Database('./db/RSA.db');

// Move all DB functions here and pass them to the router

function alertHandoff(user, events, refID, cb) {
  events.forEach((alert, index) => {
    create.alertBody(alert, refID)
      .then((alertBody) => {
        request({
          method: 'post',
          headers: {
            Authorization: `Archer session-id=${user.token}`,
          },
          url: `${process.env.base_url}/api/core/content`,
          data: alertBody,
        })
          .then((response) => {
            if (index === 0) {
              cb(null);
            }
          })
          .catch((requestError) => {
            console.log(requestError);
            cb(requestError);
          });
      })
      .catch((createBodyError) => {
        console.log(createBodyError);
        throw (createBodyError);
      });
  });
}

function processEvents(user, body) {
  return new Promise((resolve, reject) => {
    const { options } = body;
    const event = { Source: body.Source_IP, Dest: body.Destination_IP, Threat: body.Threat_Description };
    dbFunc.getEventsBy(options, event)
      .then((events) => {
        findPrevious(user.token, events[0])
          .then(contentId => create.incBody(events[0], contentId))
          .then(incBody => request({
            method: 'post',
            headers: {
              Authorization: `Archer session-id=${user.token}`,
            },
            url: `${process.env.base_url}/api/core/content`,
            data: incBody,
          }))
          .then((response) => {
            const incNumber = response.data.RequestedObject.Id;
            alertHandoff(user, events, incNumber, () => {
              dbFunc.deleteByEvent(events[0], options)
                .then((dbRes) => {
                  if (dbRes) {
                    resolve('Success');
                  } else {
                    resolve(`Error ${dbRes}`);
                  }
                })
                .catch((dbErr) => {
                  reject(dbErr);
                });
            });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

const eventsController = user => new Promise((resolve, reject) => {
  const pairsStmt = db.prepare('SELECT DISTINCT Source_IP, Destination_IP FROM events where Status not like "InActive"');
  pairsStmt.all((dbAllErr, rows) => {
    if (dbAllErr) {
      throw (dbAllErr);
    }
    if (!rows[0]) {
      resolve('No events to process');
    }
    rows.forEach((row) => {
      const incData = db.prepare('SELECT * from events WHERE Status not like "InActive" AND Source_IP=? AND Destination_IP=?');
      incData.all([row.Source_IP, row.Destination_IP], (err, inc) => {
        if (err) {
          throw (err);
        } else {
          try {
            findPrevious(user.token, inc[0])
              .then(contentId => create.incBody(inc[0], contentId))
              .then(incBody => request({
                method: 'post',
                headers: {
                  Authorization: `Archer session-id=${user.token}`,
                },
                url: `${process.env.base_url}/api/core/content`,
                data: incBody,
              }))
              .then((response) => {
                const INCNumber = response.data.RequestedObject.Id;
                alertHandoff(user, inc, INCNumber, (err) => {
                  dbFunc.deleteByEvent(inc[0])
                    .then((dbRes) => {
                      if (dbRes) {
                        resolve('Success');
                      } else {
                        resolve(`Error ${dbRes}`);
                      }
                    })
                    .catch((dbErr) => {
                      reject(dbErr);
                    });
                });
              })
              .catch((failed) => {
                reject(failed);
              });
          } catch (error) {
            throw error;
          }
        }
      });
    });
  });
});

module.exports = { eventsController, processEvents };
