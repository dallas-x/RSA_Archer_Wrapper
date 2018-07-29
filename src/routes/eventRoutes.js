import fs from 'fs';
import path from 'path';
import express from 'express';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import unzipper from 'unzipper';
import csvtojson from 'csvtojson';
import debug from 'debug';

const { execFile } = require('child_process');
const dba = require('../js/dbFunc');
const controller = require('../controllers/eventsController');

const invalidSessionToken = 'Error:  Code: {"Value":"soap:Receiver"} Reason: {"Text":{"$attributes":{"lang":"en"},"$value":"Server was unable to process request. ---> Invalid session token"}}';

const db = new sqlite3.Database('./db/testing.db');
const eventRouter = express.Router();
const DDIStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './scripts/input');
  },
  filename(req, file, callback) {
    callback(null, file.originalname);
  },
});


const DDIUpload = multer({
  storage: DDIStorage,
  filefilter: function filefilter(req, file) {
    const ext = path.extname(file.originalname);
    if (ext !== '.zip') {
      req.fileValidationError = 'Wrong File Type';
    }
    return true;
  },
}).any();

let terminal = 'powershell';
let pss = './scripts/generator.ps1';

if (!fs.existsSync('./scripts/input')) {
  fs.mkdirSync('./scripts/input');
}
if (process.platform === 'darwin') { terminal = 'pwsh'; pss = './scripts/generatorMAC.ps1'; }

eventRouter.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/auth/signIn');
  }
});

eventRouter.route('/Creator')
  .get((req, res) => {
    res.render('./events/Creator', { user: req.user });
  })
  .post((req, res) => {
    DDIUpload(req, res, (err) => {
      if (req.files.length === 0 || err) {
        res.end('File wasnt uploaded');
      }
      if (req.fileValidationError) {
        res.end('Wrong file type');
      }
      fs.readdir('./scripts/input', (error, files) => {
        if (error) {
          throw error;
        }
        let count = 0;
        files.forEach((element) => {
          fs.createReadStream(`./scripts/input/${element}`)
            .pipe(unzipper.Parse())
            .on('entry', (entry) => {
              const fileName = entry.path;
              if (fileName === 'threats.csv' && count < 3) {
                count = +1;
                entry.pipe(fs.createWriteStream(`./scripts/input/threats${count}.csv`));
              } else {
                entry.autodrain();
              }
            });
        });
      });
      execFile(terminal, [pss], (error, stdout) => {
        if (error) {
          res.end(error);
        }
        debug(stdout);
        csvtojson()
          .fromFile('./scripts/output/report.csv')
          .on('end_parsed', (jsonArrayObj) => {
            // fs.unlinkSync('./scripts/output/report.csv');
            fs.unlinkSync('./scripts/output/threats.csv');
            dba.insertEvent(jsonArrayObj, (dberr) => {
              if (dberr) throw dberr;
              res.end('SUCCESS');
            });
          })
          .on('done', (aerror) => {
            if (aerror) {
              res.end(aerror);
            }
          });
        // res.end('SUCCESS');
      });
    });
  });

eventRouter.route('/list')
  .get((req, res) => {
    db.serialize(() => {
      const stmt = db.prepare('select rowid, count(Destination_ip) as count, * from events where Status not like "InActive" group by Source_IP, Threat_Description order by count desc');
      stmt.all((err, DDIData) => {
        stmt.finalize();
        res.render('./events/list', { DDIData, user: req.user });
      });
    });
  })
  .post((req, res) => {
    try {
      controller.eventsController(req.user)
        .then((response) => {
          const outcome = String(response);
          res.end(`Please wait 2-3 minutes before logging into archer. Alerts are being created in the background ${outcome}`);
        })
        .catch((err) => {
          if (`${err}` === invalidSessionToken) {
            res.end('invalidToken');
          } else {
            res.end(`${err}`);
          }
        });
    } catch (error) {
      throw error;
    }
  });

eventRouter.route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    db.serialize(() => {
      const stmt = db.prepare('SELECT rowid, * FROM events WHERE rowid=?');
      stmt.get(id, (err, row) => {
        if (!row) {
          res.redirect('/404');
        } else {
          stmt.finalize();
          res.render('./events/event', { row, user: req.user });
        }
      });
    });
  });

eventRouter.route('/processEvents')
  .post((req, res) => {
    // res.send(req.body);
    controller.processEvents(req.user, req.body)
      .then((response) => {
        console.log(response);
        res.redirect('/events/list');
      })
      .catch((error) => {
        if (`${error}` == invalidSessionToken) {
          res.redirect('/auth/signIn');
        }
      });
  });

eventRouter.route('/delete')
  .post((req, res) => {
    db.serialize(() => {
      db.run('UPDATE events set Status = "InActive"', (err) => {
        if (err) {
          res.end(`${err}`);
        } else {
          res.redirect('/events/list');
        }
      });
    });
  });

eventRouter.route('/deleteEvent')
  .post((req, res) => {
    const args = [req.body.Source_IP, req.body.Threat_Description];
    db.serialize(() => {
      const stmt = db.prepare('delete from events where Source_IP=? and Threat_Description=?');
      stmt.run(args, (err) => {
        if (!err) {
          res.redirect('/events/list');
        } else {
          res.end('Could not process this request');
        }
      });
    });
  });

eventRouter.route('/downloadEvents')
  .post((req, res) => {
    const filePath = path.resolve('./scripts/output/report.csv');
    console.log(filePath);
    const fileName = 'report.csv'; // The default name the browser will use

    res.download(filePath, fileName);
  });

module.exports = eventRouter;
