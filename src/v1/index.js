const pg = require('pg');
const url = require('url');
const co = require('co');

const params = url.parse(process.env.DATABASE_URL);
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

const TimeToken = function () {
    this.timeBegin = Date.now()
    this.timeSpent = []
    this.toNow = () => {
        var data = Date.now() - this.timeBegin
        this.timeSpent.push(data)
        return data + 'ms'
    }
}

// SELECT data->'name' AS info FROM test WHERE data @> '{{"emplId": "hong"}}';

const CommonQuery = function (config) {
  this.config = config
  return co.wrap(function* (ctx, parameter) {
    yield new Promise((resolve, reject) => {
        var timeToken = new TimeToken
        pool.connect((err, client, done) => {
            if (err) {
                return console.error('error fetching client from pool', err);
            }
            console.log('数据库连接耗时: ' + timeToken.toNow())
            client.query(this.config.query(ctx, parameter || null)).then(res => {
                done();
                if (err) { return console.error(err); }
                this.config.fn(ctx, res)
                console.log('数据库操作共耗时: ' + timeToken.toNow())
                resolve()
            })
        });
        setTimeout(function() {
            reject('超时, 请查看刚才是否已经操作成功')
        }, 5000);
    }).catch(function (err) {
        ctx.body = err
        console.error('用户访问出错: ' + err)
    })
  }.bind(this));
}

module.exports = {
    newMark: new CommonQuery({
        query: (ctx) => {
            const title = ctx.request.body.title,
                  description = ctx.request.body.description,
                  itemsId = ctx.request.body.itemsId,
                  markers = ctx.request.body.markers,
                  berateds = ctx.request.body.berateds,
                  createTimestamp = parseInt(Date.now() / 1000);
            return {
                text: 'INSERT INTO mark (title, description, items_id, markers, berateds, create_timestamp)'
                 + ' VALUES ($1, $2, $3, $4, $5, $6);',
                values: [title, description, itemsId, markers, berateds, createTimestamp]
            }
        },
        fn: (ctx, res) => {
            if (res.rowCount > 0) {
                return ctx.body = '{"state": "1101", "result": "成功创建一次评分"}'
            }
            ctx.body = '{"error": "出错了"}'
        }
    }),

    newMarkItem: new CommonQuery({
        query: (ctx) => {
            const description = ctx.request.body.description,
                  totalValue = ctx.request.body.totalValue
            return {
                text: 'INSERT INTO mark_item (description, total_value) VALUES ($1, $2);',
                values: [description, totalValue]
            }
        },
        fn: (ctx, res) => {
            var out = '错误'
            if (res.rowCount > 0) {
                out = '成功插入'
            }
            ctx.body = '{"state": "1201", "result": "' +  out + '"}'
        }
    }),

    markInfo: new CommonQuery({
        query: (ctx, markId) => {
            console.log(markId)
            return {
                text: 'SELECT * FROM test WHERE data @> $1;',
                values: ['[{"name": "小红"}]']
            }
        },
        fn: (ctx, res) => {
            console.log(res.rows)
            ctx.body = '完全结束, 成功. '
        }
    })
}
