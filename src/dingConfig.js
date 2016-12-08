const co = require('co');
const randomstring = require('randomstring');
var https = require('https');
var querystring = require('querystring');
var url = require('url');
var crypto = require('crypto');

const OAPI_HOST = 'https://oapi.dingtalk.com';
const corpId = process.env.CORPID || require('../env').corpId;
const secret = process.env.CORPSECRET || require('../env').secret;

function invoke (path, params) {
  return new Promise(function (resolve, reject) {
    const getUrl = OAPI_HOST + path + '?' + querystring.stringify(params);
    https.get(getUrl, function (res) {
      if (res.statusCode === 200) {
        var body = '';
        res.on('data', function (data) {
          body += data;
        }).on('end', function () {
          var result = JSON.parse(body);
          if (result && 0 === result.errcode) {
            resolve(result);
          }
          reject(result);
        });
      } else {
        reject(res.statusCode + '访问失败');
      }
    });
  }).catch((err) => {
    console.log('Promise 错误' + err);
  });
}

function sign (params) {
  var origUrl = params.url;
  var origUrlObj = url.parse(origUrl);
  delete origUrlObj['hash'];
  var newUrl = url.format(origUrlObj);
  var plain = 'jsapi_ticket=' + params.ticket +
    '&noncestr=' + params.nonceStr +
    '&timestamp=' + params.timeStamp +
    '&url=' + newUrl;

  // console.log(plain);
  var sha1 = crypto.createHash('sha1');
  sha1.update(plain, 'utf8');
  var signature = sha1.digest('hex');
  // console.log('signature: ' + signature);
  return signature;
}

// return:
// userid 员工在企业内的UserID
// deviceId 手机设备号,由钉钉在安装时随机产生
// is_sys 是否是管理员
// sys_level 级别，0：非管理员 1：超级管理员（主管理员） 2：普通管理员（子管理员） 100：老板

const getUserInfo = co.wrap(function* (code) {
  const accessToken = (yield invoke('/gettoken', {
    corpid: corpId,
    corpsecret: secret
  }))['access_token'];
  return (yield invoke('/user/getuserinfo', {
    access_token: accessToken,
    code: code
  }));
});

const dingJsInfo = co.wrap(function* (url) {
  var nonceStr = randomstring.generate(7);
  var timeStamp = new Date().getTime();
  var signedUrl = decodeURIComponent(url);

  function g () {
    return co(function* () {
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
        agentId: process.env.AGENTID || 'noneInTestEvn',
        signature: signature,
        nonceStr: nonceStr,
        timeStamp: timeStamp,
        corpId: corpId
      };
    }).catch(function (err) {
      console.log(err);
    });
  }

  return JSON.stringify(yield g());

});

module.exports = {
  dingJsInfo: dingJsInfo,
  getUserInfo: getUserInfo,
};
