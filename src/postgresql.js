const pg = require('pg');
const url = require('url');

const postgreUrl = process.env.DATABASE_URL || require('../env').postgreUrl;
const params = url.parse(postgreUrl);

const auth = params.auth.split(':');

const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
};

var pool = new pg.Pool(config);

pool.on('error', function (err, client) {
  console.error('idle client error', err.message, err.stack);
});

module.exports = pool;
