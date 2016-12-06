/* global dd _config */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  // 中转数据
  _allItems: [],

  // 要提交的数据
  _players: [],
  _items: {},

  selectPlayers: function () {
    choosePeople('players', function (data) {
      this._players = data;
      alert(this._players);
    }.bind(this));
  },

  displayAllItems: function () {
    document.querySelector('.all-items').classList.remove('hidden');
    scroll(0, 0);
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

    this._renderSelectItem(id, 'add');
    this._renderItemDom(this._allItems[id]);
    this.hideAllItems();
  },

  _renderSelectItem: function (id, change) {
    var num = this._allItems.length - id;
    var el = document.querySelector('.all-items li:nth-child(' + num + ')');
    if (change === 'add') {
      return el.classList.add('selected');
    }
    return el.classList.remove('selected');
  },

  _renderItemDom: function (data) {
    // TODO: 将 label 和 input 进行关联,
    //       https://www.w3.org/wiki/HTML/Elements/label
    var el1 = document.createElement('fieldset');
    var el11 = document.createElement('legend');
    var el12 = document.createElement('label');
    var el13 = document.createElement('input');
    var el14 = document.createElement('div');
    var el15 = document.createElement('label');
    var el16 = document.createElement('ul');
    var el17 = document.createElement('button');
    el1.classList.add('left-space');
    el1.id = 'item' + data.id;
    el11.innerText = data.name;
    el12.innerText = '总分值';
    el13.setAttribute('type', 'text');
    el13.setAttribute('name', 'score' + data.id);
    el14.classList.add('bottom-space');
    el15.innerText = '评分人';
    el16.id = 'markers' + data.id;
    el17.classList.add('pure-button');
    el17.innerText = '选择评分人';
    el17.setAttribute('onclick', 'choosePeople(\'markers\', ' + data.id + ')');
    el1.appendChild(el11);
    el1.appendChild(el12);
    el1.appendChild(el13);
    el1.appendChild(el14);
    el1.appendChild(el15);
    el1.appendChild(el16);
    el1.appendChild(el17);
    return document.querySelector('.pure-form > fieldset').appendChild(el1);
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
  jsApiList: [
    'runtime.permission',
    'device.notification.alert',
    'biz.contact',
  ],
});

function choosePeople (key, fn) {
  // TODO: 记录上次选中的人
  dd.biz.contact.choose({
    startWithDepartmentId: 0,
    multiple: true,
    users: [], // [String, ...]
    corpId: _config.corpId,
    onSuccess: fn,
    onFail: function (err) {
      alert('出错了' + JSON.stringify(err));
    },
  });
}

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
