/* global dd _config _id */

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
    return fetch('/api/v2/mark-items/' + _id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Dingding-Auth': this.dingCode,
      },
      body: JSON.stringify(data),
    }).then(function (response) {
      if (response.status !== 204) {
        throw new Error('插入失败');
      }
      return true;
    });
  },
  save: function () {
    this._saveData().then(function (v) {
      if (v) {
        alert('保存成功');
      }
    }).catch(function (err) {
      console.log(err);
    });
    alert('已提交修改, 请等待.');
  },
  _getData: function _getData (id) {
    return fetch('/api/v2/mark-items/' + id, {
      method: 'GET',
    }).then(function (response) {
      if (response.status !== 200) {
        throw new Error('获取信息失败');
      }
      return response.json();
    });
  },
  render: function () {
    this._getData(_id).then(function (json) {
      return json.result;
    }).then(function(v) {
      document.querySelector('[name=title]').value = v.name;
      document.querySelector('[name=description]').value = v.desc;
      document.querySelector('[name=grading]').value = v.grading;
      document.querySelector('.loading').classList.add('hidden');
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

document.addEventListener('DOMContentLoaded', function () {
  app.render();
});
