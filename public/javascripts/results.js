/* global dd _config */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  _getData: function _getData () {
    return fetch('/api/v2/marks', {
      method: 'GET',
      headers: {
        'Dingding-Auth': this.dingCode,
      },
    }).then(function (response) {
      if (response.status !== 200) {
        throw new Error('查询失败');
      }
      return response.json();
    });
  },

  render: function () {
    this._getData().then(function (json) {
      var res = json.result;
      var i;
      for (i = res.length - 1; i >= 0; i--) {
        document.body.appendChild(this.baseRender(res[i]));
      }
      document.querySelector('.loading').classList.add('hidden');
    }.bind(this));
  },

  baseRender: function (data) {
    var time = new Date(parseInt(data.createTime, 10) * 1000);
    var url = '/result/' + data.id;

    var el = document.createElement('div');
    var el1 = document.createElement('div');
    var el11 = document.createElement('a');
    var el12 = document.createElement('span');
    var el2 = document.createElement('div');
    var el21 = document.createElement('a');
    var el211 = document.createElement('i');
    var el212 = document.createElement('span');

    el.setAttribute('class', 'display-line marks');
    el1.setAttribute('class', 'title');
    el11.setAttribute('href', url);
    el11.innerText = data.title;
    el12.setAttribute('class', 'time');
    el12.innerText = time.toLocaleString();
    el2.setAttribute('class', 'icon');
    el21.setAttribute('class', 'pure-button');
    el21.setAttribute('href', url);
    el211.setAttribute('class', 'fa fa-info-circle');
    el211.setAttribute('aria-hidden', 'true');
    el212.innerText = ' 查询';

    el.appendChild(el1);
    el.appendChild(el2);
    el1.appendChild(el11);
    el1.appendChild(el12);
    el2.appendChild(el21);
    el21.appendChild(el211);
    el21.appendChild(el212);

    return el;
  },

  dingCode: '',
};

dd.config({
  agentId: _config.agentId,
  corpId: _config.corpId,
  timeStamp: _config.timeStamp,
  nonceStr: _config.nonceStr,
  signature: _config.signature,
  jsApiList: ['runtime.permission',
    'device.notification.alert'],
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
