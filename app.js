/**
 * Created by liqiao on 8/10/15.
 * Modified by Zsqk.
 */

const Koa = require('koa');
const app = new Koa();
const co = require('co');
const serve = require('koa-static');
const _ = require('koa-route');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress')

// 业务模块导入
const pets = require('./src/pets.js');
const api = require('./src/api.js');
const rendering = require('./src/rendering.js');

app.use(serve('public'));

app.use(compress({
    threshold: 1024,
    flush: require('zlib').Z_SYNC_FLUSH
}))

app.use(co.wrap(function *(ctx, next) {
  ctx.type = 'application/json; charset=utf-8'
  yield next();
}));

app.use(bodyParser());

app.use(_.get('/pets', pets.list));
app.use(_.get('/pets/:name', pets.show));
app.use(_.get('/mark/:markId', rendering.markInfo))

app.use(_.post('/api/v1/new-mark', api.v1.newMark))
app.use(_.post('/api/v1/new-mark-item', api.v1.newMarkItem))
app.use(_.get('/api/v1/mark-info/:markId', api.v1.markInfo)) // 不验证权限
// app.use(_.post('/api/v1/mark/:markId', api.v1.markIt))
// app.use(_.get('/api/v1/results/:markId/mine', api.v1.myMarkResults))
// app.use(_.get('/api/v1/results/:markId', api.v1.markResults))

// --- 以下为前端渲染 ---

const Pug = require('koa-pug')
const pug = new Pug({
  viewPath: './views',
  debug: false,
  pretty: false,
  compileDebug: false,
  app: app
})

var dingdingSign = {
    accessToken: '',
    ticket: '',
    expiration: 0
}

app.use(co.wrap(function *(ctx, next) {

    ctx.render('index', {
        title: '测试中',
        config: yield require('./src/dingConfig.js')(ctx.href)
    })

}));

app.listen(process.env.PORT || 9876);
