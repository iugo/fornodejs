/* global dd _config */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  _getData: function _getData () {
    return fetch('/api/v2/mark-items', {
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
    var _this = this;
    console.log('开始渲染');
    this._getData().then(function (json) {
      var res = json.result;
      var i;
      for (i = res.length - 1; i >= 0; i--) {
        document.body.appendChild(_this.baseRender(res[i]));
      }
      document.querySelector('.loading').classList.add('hidden');
    });
  },
  baseRender: function (data) {
    var el1 = document.createElement('div');
    var el11 = document.createElement('a');
    var el12 = document.createElement('div');
    var el121 = document.createElement('a');
    var el122 = document.createElement('button');
    el1.setAttribute('class', 'display-line');
    el1.id = data.id;
    el11.setAttribute('href', '/item/' + data.id);
    el11.setAttribute('class', 'pure-button not-button');
    el11.innerText = data.name;
    el12.setAttribute('class', 'content-right');
    el121.setAttribute('class', 'pure-button right-space');
    el121.setAttribute('href', '/item/' + data.id);
    el121.innerText = '明细/修改';
    el122.setAttribute('class', 'pure-button');
    el122.setAttribute('onclick', 'app.deleteItem(' + data.id + ');');
    el122.innerText = '删除';
    el1.appendChild(el11);
    el1.appendChild(el12);
    el12.appendChild(el121);
    el12.appendChild(el122);
    return el1;
  },
  deleteItem: function (id) {
    fetch('/api/v2/mark-items/' + id, {
      method: 'DELETE',
      headers: {
        'Dingding-Auth': this.dingCode,
      },
    }).then(function (response) {
      if (response.status !== 204) {
        throw new Error(response.json());
      }
      this._removeItemDom(id);
      alert('删除成功');
    }.bind(this)).catch(function(err) {
      console.log(err);
    });
  },
  _removeItemDom: function (id) {
    var line = document.getElementById(id);
    document.querySelector('body').removeChild(line);
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
