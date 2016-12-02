/* global dd _config */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

function saveData() {
  var name = document.querySelector('[name=title]').value;
  var desc = document.querySelector('[name=description]').value;
  var grading = document.querySelector('[name=grading]').value;
  var data = {
    name: name,
    desc: desc,
    grading: grading,
  };
  fetch('/api/v1/mark-items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Dingding-Auth': 'code', // TODO
    },
    body: JSON.stringify(data),
  }).then(function (response) {
    if (response.status !== '201') {
      throw new Error('插入失败');
    }
    return response.json();
  }).catch(function (err) {
    console.log(err);
  });
}

var app = {
  save: function () {
    saveData();
    window.location = '/items';
  },
  addAnother: function () {
    saveData();
    window.location.reload(true);
  },
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
      alert('自动登入 code 为: ' + JSON.stringify(result));
    },
    onFail: function (err) {
      alert('无法获得 code: ' + JSON.stringify(err));
    },
  });
});
