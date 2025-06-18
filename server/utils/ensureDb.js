const fs = require('fs');
const path = require('path');

const ensureDbDirectory = () => {
  const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'kurukshetra.sqlite');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory at:', dbDir);
  }
};

module.exports = { ensureDbDirectory };