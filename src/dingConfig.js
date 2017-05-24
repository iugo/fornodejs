require('dotenv').config();
const randomstring = require('randomstring');
const https = require('https');
const querystring = require('querystring');
const url = require('url');
const crypto = require('crypto');

const OAPI_HOST = 'https://oapi.dingtalk.com';
const corpId = process.env.CORPID;
const secret = process.env.CORPSECRET;

/**
 * 调用钉钉服务器 API
 * @param {string} path - 调用路径
 * @param {object} params - 调用参数
 * @return {Promise}
 */
function invoke(path, params) {
  return new Promise((resolve, reject) => {
    const getUrl = `${OAPI_HOST + path}?${querystring.stringify(params)}`;
    https.get(getUrl, res => {
      if (res.statusCode === 200) {
        let body = '';
        res.on('data', data => {
          body += data;
        }).on('end', () => {
          const result = JSON.parse(body);
          if (result && result.errcode === 0) {
            resolve(result);
          }
          reject(result);
        });
      } else {
        reject(`res.statusCode}访问失败`);
      }
    });
  });
}

/**
 * 钉钉 API 生成签名
 * @param {object} params - 参数
 * @return {string}
 */
function sign(params) {
  const origUrl = params.url;
  const origUrlObj = url.parse(origUrl);
  delete origUrlObj.hash;
  const newUrl = url.format(origUrlObj);
  const plain = 'jsapi_ticket=' + params.ticket +
    '&noncestr=' + params.nonceStr +
    '&timestamp=' + params.timeStamp +
    '&url=' + newUrl;
  const sha1 = crypto.createHash('sha1');
  sha1.update(plain, 'utf8');
  const signature = sha1.digest('hex');
  return signature;
}

/**
 * 获得钉钉 accessToken
 * @return {Promise.<string>}
 */
async function getToken() {
  return (await invoke('/gettoken', {
    corpid: corpId,
    corpsecret: secret
  })).access_token;
}

/**
 * 获得用户基本信息
 * @param {string} code - 从钉钉前端获取的 code
 * @return {Promise.<object>} userInfo
 * userid    - 员工在企业内的UserID
 * deviceId  - 手机设备号,由钉钉在安装时随机产生
 * is_sys    - 是否是管理员
 * sys_level - 级别，0：非管理员 1：超级管理员（主管理员） 2：普通管理员（子管理员） 100：老板
 */
async function getUserInfo(code) {
  const accessToken = await getToken();
  return invoke('/user/getuserinfo', {
    access_token: accessToken,
    code
  });
}

/**
 * 获得钉钉前端配置信息
 * @param {string} remoteUrl - 被访问的 URL
 * @return {Object}
 */
async function dingJsInfo(remoteUrl) {
  const nonceStr = randomstring.generate(7);
  const timeStamp = new Date().getTime();
  const signedUrl = decodeURIComponent(remoteUrl);

  const accessToken = await getToken();

  const ticket = (await invoke('/get_jsapi_ticket', {
    type: 'jsapi',
    access_token: accessToken
  })).ticket;

  const signature = sign({
    nonceStr,
    timeStamp,
    url: signedUrl,
    ticket,
  });

  return JSON.stringify({
    agentId: process.env.AGENTID || 'noneInTestEvn',
    signature,
    nonceStr,
    timeStamp,
    corpId,
  });
}

module.exports = {
  dingJsInfo,
  getUserInfo,
};
