/**
 * Created by liqiao on 8/10/15.
 * Modified by Zsqk.
 */

const Koa = require('koa');
const app = new Koa();
const co = require('co');
const randomstring = require('randomstring');
const serve = require('koa-static');
const _ = require('koa-route');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress')

var https = require("https");
var querystring = require('querystring');
var url = require('url');
var crypto = require('crypto');

// 业务模块导入
const pets = require('./src/pets.js');
const api = require('./src/api.js');

const OAPI_HOST = 'https://oapi.dingtalk.com';
const corpId = process.env.CORPID || require('./env').corpId;
const secret = process.env.CORPSECRET || require('./env').secret;

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
    var nonceStr = randomstring.generate(7);
    var timeStamp = new Date().getTime();
    var signedUrl = decodeURIComponent(ctx.href);

    function g() {
        return co(function *() {
            var accessToken = (yield invoke('/gettoken', {
                corpid: corpId,
                corpsecret: secret
            }))['access_token'];
            var ticket = (yield invoke('/get_jsapi_ticket', {
                type: 'jsapi',
                access_token: accessToken
            }))['ticket'];
            var signature = sign({
                nonceStr: nonceStr,
                timeStamp: timeStamp,
                url: signedUrl,
                ticket: ticket
            });
            return {
                agentId: process.env.AGENTID || 'none',
                signature: signature,
                nonceStr: nonceStr,
                timeStamp: timeStamp,
                corpId: corpId
            };
        }).catch(function(err) {
            console.log(err);
        });
    };

    ctx.render('index', {
        title: '测试中',
        config: JSON.stringify(yield g())
    })

}));

app.listen(process.env.PORT || 9876);

function invoke(path, params) {
    return new Promise (function(resolve, reject) {
        https.get(OAPI_HOST + path + '?' + querystring.stringify(params), function(res) {
            if (res.statusCode === 200) {
                var body = '';
                res.on('data', function (data) {
                    body += data;
                }).on('end', function () {
                    var result = JSON.parse(body);
                    if (result && 0 === result.errcode) {
                        // console.log('获取到了结果' + (result.access_token || result.ticket))
                        resolve(result)
                    }
                    reject(result)
                });
            } else {
                reject(res.statusCode + '访问失败')
            }
        })
    }).catch(err => {
        console.log('Promise 错误' + err)
    })
}

function sign(params) {
    var origUrl = params.url;
    var origUrlObj =  url.parse(origUrl);
    delete origUrlObj['hash'];
    var newUrl = url.format(origUrlObj);
    var plain = 'jsapi_ticket=' + params.ticket +
        '&noncestr=' + params.nonceStr +
        '&timestamp=' + params.timeStamp +
        '&url=' + newUrl;

    console.log(plain);
    var sha1 = crypto.createHash('sha1');
    sha1.update(plain, 'utf8');
    var signature = sha1.digest('hex');
    console.log('signature: ' + signature);
    return signature;
}
