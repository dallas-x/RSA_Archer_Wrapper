import sqlite3 from 'sqlite3';
import _ from 'underscore';

const db = new sqlite3.Database('./db/RSA.db');

const createTables = function createTables() {
  db.run(`CREATE TABLE if not exists
      "isoTracker" ( "INCNumber" text, "Date_ISO_Sent" DATE NOT NULL, "Date_noticed" DATE,
    "Date_Confirmed" DATE, "Department" TEXT NOT NULL, "Issue" TEXT NOT NULL, "Remediation_Taken" TEXT,
    "Tools" TEXT, "Analyst" TEXT NOT NULL, "Confirmed_Malicious" TEXT, "ISO_Call_Date" DATE, "Response" TEXT,
    "Escalation" TEXT )`);

  db.run(`create table if not exists
  events (IDS TEXT, Date TIMESTAMP, Severity TEXT,
    Detection_Type TEXT, Threat_Description TEXT,
    Source_IP TEXT, Destination_IP TEXT, Source_Port TEXT,
    Destination_port TEXT, Source_MAC_Address TEXT, Hostname TEXT,
    Destination_Hostname TEXT, Source_Hostname TEXT, Destination_Group_Name TEXT,
    Attack_phase TEXT, Reference TEXT, Sha256 TEXT, Status TEXT )`);
};

const insertEvent = function insertEvents(json, callback) {
  const keys = _.keys(json[0]);
  db.serialize(() => {
    const stmt = db.prepare('INSERT into events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
    json.forEach((event, index) => {
      const statement = [];
      keys.forEach((k) => {
        statement.push(event[k]);
      });
      stmt.run(statement, (err) => {
        if (err) {
          callback(err);
        } else if (index === json.length - 1) {
          callback(null);
        }
      });
    });
  });
};

const insertISONotification = function insertISONotifications(iso, callback) {
  const stmt = db.prepare('INSERT into isoTracker VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const statement = [iso.INCNumber, iso.Date_Sent, iso.Date_noticed,
    iso.Date_Confirmed, iso.Department, iso.Issue, iso.Remediation, iso.Tools,
    iso.AnalystName, iso.Malicious, iso.ISO_CallDate, iso.Response, iso.Esculation, iso.CALCSIRS];
  stmt.run(statement);
  callback(null, 'SUCCESS');
};

function getEventsBy(option, event) {
  return new Promise((resolve, reject) => {
    switch (option) {
      case 'sd': {
        const stmt = db.prepare('SELECT * from events WHERE Status not like "InActive" AND Source_IP=? AND Destination_IP=? order by Date desc');
        stmt.all([event.Source, event.Dest], (err, events) => {
          if (err) {
            reject(err);
          } else {
            resolve(events);
          }
        });
        break;
      }
      case 'st': {
        const stmt = db.prepare('SELECT * from events WHERE Status not like "InActive" AND Source_IP=? AND Threat_Description=? order by Date desc');
        stmt.all([event.Source, event.Threat], (err, events) => {
          if (err) {
            reject(err);
          } else {
            resolve(events);
          }
        });
        break;
      }
      case 'td': {
        const stmt = db.prepare('SELECT * from events WHERE Status not like "InActive" AND Destination_IP=? AND Threat_Description=? order by Date desc');
        stmt.all([event.Dest, event.Threat], (err, events) => {
          if (err) {
            reject(err);
          } else {
            resolve(events);
          }
        });
        break;
      }
      default:
        break;
    }
  });
}

function deleteById(rowid) {
  return new Promise((resolve, reject) => {
    const id = Number(rowid);
    db.serialize(() => {
      try {
        const stmt = db.prepare('update events SET Status = "InActive" Where rowid=?');
        stmt.run([id], (err) => {
          if (err) {
            resolve(false);
          } else {
            console.log(err);
            resolve(true);
          }
          stmt.finalize();
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

function deleteByEvent(event, options) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      try {
        switch (options) {
          case 'td': {
            const arrArguments = [event.Destination_IP, event.Threat_Description];
            const stmt = db.prepare('update events set Status = "InActive" Where Destination_IP=? AND Threat_Description=?');
            stmt.run(arrArguments, (err) => {
              if (err) {
                resolve(false);
              } else {
                stmt.finalize();
                resolve(true);
              }
            });
            break;
          }
          case 'st': {
            const arrArguments = [event.Source_IP, event.Threat_Description];
            const stmt = db.prepare('update events set Status = "InActive" Where Source_IP=? AND Threat_Description=?');
            stmt.run(arrArguments, (err) => {
              if (err) {
                resolve(false);
              } else {
                stmt.finalize();
                resolve(true);
              }
            });
            break;
          }
          default: {
            const arrArguments = [event.Source_IP, event.Destination_IP];
            const stmt = db.prepare('update events set Status = "InActive" Where Source_IP=? AND Destination_IP=?');
            stmt.run(arrArguments, (err) => {
              if (err) {
                resolve(false);
              } else {
                stmt.finalize();
                resolve(true);
              }
            });
            break;
          }
        }
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  });
}

function dashboard() {
  return new Promise((resolve, reject) => {
    db.parallelize(() => {
      const threat = [];
      const tcount = [];
      const source = [];
      const scount = [];
      const type = [];
      const tycount = [];
      const months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const Response = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const webData = {};
      const getThreat = db.prepare('SELECT Threat_Description, count(Source_IP) as count from events group by Threat_Description order by count desc LIMIT 5');
      getThreat.all((err, threats) => {
        threats.forEach((value) => {
          threat.push(`"${value.Threat_Description}"`);
          tcount.push(value.count);
        });
        webData.threat = threat;
        webData.tcount = tcount;
        const getSource = db.prepare('SELECT Source_IP, count(Source_IP) as count from events group by Source_IP order by count desc LIMIT 5');
        getSource.all((err, sources) => {
          sources.forEach((value) => {
            source.push(`"${value.Source_IP}"`);
            scount.push(value.count);
          });
          webData.source = source;
          webData.scount = scount;
          const getType = db.prepare('SELECT Detection_Type, count(Detection_Type) as count from events group by Detection_Type order by count desc LIMIT 5');
          getType.all((err, types) => {
            types.forEach((value) => {
              type.push(`"${value.Detection_Type}"`);
              tycount.push(value.count);
            });
            webData.type = type;
            webData.tycount = tycount;
            const stmt = db.prepare('select Date_ISO_Sent, Response from isoTracker');
            stmt.all((err, rows) => {
              rows.forEach((value) => {
                const isoDate = new Date(value.Date_ISO_Sent);
                for (let i = 0; i < rows.length; i++) {
                  if (isoDate.getMonth() === i) {
                    if (value.Response === 'yes') {
                      Response[i] += 1;
                    }
                    months[i] += 1;
                  }
                }
              });
              webData.months = months;
              webData.Response = Response;
              resolve(webData);
            });
          });
        });
      });
    });
  });
}


module.exports = {
  createTables,
  insertEvent,
  insertISONotification,
  getEventsBy,
  deleteById,
  deleteByEvent,
  dashboard,
};
