import fs from 'fs';

const moveFile = function moveFile(from, to) {
  const source = fs.createReadStream(from);
  const dest = fs.createWriteStream(to);

  return new Promise((resolve, reject) => {
    source.on('end', resolve);
    source.on('error', reject);
    source.pipe(dest);
  });
};

module.exports = moveFile;
