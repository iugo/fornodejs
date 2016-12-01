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
const compress = require('koa-compress');

// 业务模块导入
const pets = require('./src/pets.js');
const api = require('./src/api.js');
const rendering = require('./src/rendering.js');

app.use(serve('public'));

app.use(compress({
  threshold: 1024,
  flush: require('zlib').Z_SYNC_FLUSH
}));

app.use(co.wrap(function *(ctx, next) {
  ctx.type = 'application/json; charset=utf-8';
  yield next();
}));

app.use(bodyParser());

app.use(_.get('/pets', pets.list));
app.use(_.get('/pets/:name', pets.show));
app.use(_.get('/mark/:markId', rendering.markInfo));

app.use(_.post('/api/v1/new-mark', api.v1.newMark));
app.use(_.post('/api/v1/new-mark-item', api.v1.newMarkItem));
app.use(_.get('/api/v1/mark-info/:markId', api.v1.markInfo)); // 不验证权限
// app.use(_.post('/api/v1/mark/:markId', api.v1.markIt))
// app.use(_.get('/api/v1/results/:markId/mine', api.v1.myMarkResults))
// app.use(_.get('/api/v1/results/:markId', api.v1.markResults))

// --- 以下为前端渲染 ---
// 其实我是想要用单页应用的, 强烈愿望. 可是我赞同其思想的 Polymer 不给力, 流行的 React 我
// 又不够熟, 无法在几天内完成该项目, 所以只好一页页渲染. 工具类就该单页应用, TODO.
// 尤其又是基于钉钉的后端无 session 认证系统, 需要钉钉前端 SDK 传来一个参数才能进一步进行
// 认证, 导致无法直接服务端渲染. 更加适合单页应用在客户端异步渲染. -- iugo

const Pug = require('koa-pug');
new Pug({
  viewPath: './views',
  debug: false,
  pretty: false,
  compileDebug: false,
  app: app
});

app.use(_.get('/new-item', co.wrap(function *(ctx) {
  ctx.render('new-item', {
    title: '项目设定 -> 新建',
    config: yield require('./src/dingConfig.js')(ctx.href)
  });
})));

app.use(_.get('/items', co.wrap(function *(ctx) {
  ctx.render('items', {
    title: '项目设定 -> 管理',
    config: yield require('./src/dingConfig.js')(ctx.href)
  });
})));

app.use(_.get('/item/:itemId', co.wrap(function *(ctx, itemId) {
  ctx.render('item-info', {
    title: '项目设定 -> 详情',
    itemId: itemId,
    config: yield require('./src/dingConfig.js')(ctx.href)
  });
})));

app.use(co.wrap(function *(ctx, next) {

  ctx.render('index', {
    title: '测试中',
    config: yield require('./src/dingConfig.js')(ctx.href)
  });

}));

app.listen(process.env.PORT || 9876);
