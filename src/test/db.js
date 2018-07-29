const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./db/testing.db');

db.serialize(() => {
  const stmt = db.prepare('select Date_ISO_Sent from isoTracker');
  stmt.all((err, rows) => {
    const months = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    rows.forEach((value) => {
      const isoDate = new Date(value.Date_ISO_Sent);
      for (let i = 0; i < rows.length; i++) {
        if (isoDate.getMonth() === i) {
          months[i] += 1;
        }
      }
    });
  });
});
