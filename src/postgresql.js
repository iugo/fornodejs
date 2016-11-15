const pg = require('pg');
const url = require('url');

// const params = url.parse(process.env.DATABASE_URL);
const params = url.parse('postgres://vqgmauvejnqoqp:EmO75492Xr1gYpGo6ZG5j_LgEp@ec2-54-243-249-159.compute-1.amazonaws.com:5432/d70ldrtuq73921');

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
    console.error('idle client error', err.message, err.stack)
})

module.exports = pool;
