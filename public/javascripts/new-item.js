/* global dd _config */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  _saveData: function () {
    var name = document.querySelector('[name=title]').value;
    var desc = document.querySelector('[name=description]').value;
    var grading = document.querySelector('[name=grading]').value;
    var data = {
      name: name,
      desc: desc,
      grading: grading,
    };
    return fetch('/api/v2/mark-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Dingding-Auth': this.dingCode,
      },
      body: JSON.stringify(data),
    }).then(function (response) {
      console.log(response.status);
      if (response.status !== 201) {
        throw new Error('插入失败');
      }
      return response.json();
    }).catch(function (err) {
      console.log(err);
    });
  },

  save: function () {
    this._saveData().then(function (json) {
      if (json.error === 0) {
        alert('插入成功');
        window.location = '/items';
      } else {
        alert('插入失败: ' + json.error);
      }
    });
  },

  addAnother: function () {
    this._saveData().then(function (json) {
      if (json.error === 0) {
        alert('插入成功');
        window.location.reload(true);
      } else {
        alert('插入失败, 请重试');
      }
    });
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
