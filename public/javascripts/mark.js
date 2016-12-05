/* global dd _config */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  // 中转数据
  _allItems: [],

  // 要提交的数据
  _players: [],
  _items: {},

  selectPlayers: function () {
  },

  displayAllItems: function () {
    document.querySelector('.all-items').classList.remove('hidden');
  },

  hideAllItems: function () {
    document.querySelector('.all-items').classList.add('hidden');
  },

  selectItem: function (id) {
    var itemId = this._allItems[id].id;

    if (this._items[itemId] !== undefined) {
      return;
    }

    this._items[itemId] = {
      score: 0,
      markers: [],
    };
    console.log('选择了: ' + this._allItems[id].name);
  },

  _renderItemDom: function (data) {

  },

  deleteItem: function (id) {
  },

  _getAllItems: function _getAllItems () {
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
    }).then(function (json) {
      this._allItems = json.result;
      return json.result;
    }.bind(this)).then(function(data) {
      var i;
      var li;
      for (i = data.length - 1; i >= 0; i--) {
        li = document.createElement('li');
        li.innerText = data[i].name;
        li.setAttribute('onclick', 'app.selectItem(' + i + ');');
        document.querySelector('.all-items ul').appendChild(li);
      }
      document.querySelector('.all-items .loading').classList.add('hidden');
    });
  },

  _postData: function _postData () {
    return fetch('/api/v2/', {
      method: 'POST',
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
    this._getAllItems();
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
