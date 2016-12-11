/* global dd _config _id Promise */

/*
  功能分为两块:
  1. 获取用户需要的评分.
    1-1. 当用户有待评分项目时, 列出评分框.
    1-2. 当用户已经评分完毕时, 列出提示.
    1-3. 当用户不属于该评分任务的评分人时, 列出提示.
  2. 用户提交针对某人的评分.
    2-1. 用户可以提交新数据, 成功之后删除相应评分 DOM 区块.
 */

var app = {
  _players: [],
  _items: {},

  _getData: function () {
    return fetch('/api/v2/marks/' + _id + '/user', {
      method: 'GET',
      headers: {
        'Dingding-Auth': this.dingCode,
      },
    }).then(function (response) {
      var text = response.text();
      alert(text);
      return text;
    });
  },

  render: function () {
    setTimeout(this._getData(), 2000);
  },

  dingCode: '',
};

dd.config({
  agentId: _config.agentId,
  corpId: _config.corpId,
  timeStamp: _config.timeStamp,
  nonceStr: _config.nonceStr,
  signature: _config.signature,
  jsApiList: [
    'runtime.permission',
    'runtime.permission.requestAuthCode',
    'device.notification.alert',
    'biz.contact.choose',
  ],
});

dd.ready(function () {
  dd.runtime.permission.requestAuthCode({
    corpId: _config.corpId,
    onSuccess: function (result) {
      app.dingCode = result.code;
    },
    onFail: function (err) {
      alert('无法获得 code: ' + JSON.stringify(err));
    },
  });
});

document.addEventListener('DOMContentLoaded', function () {
  app.render();
});
