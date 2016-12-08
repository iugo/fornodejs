/* global dd _config _id Promise */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  // 中转数据
  _allItems: [],

  // 要提交的数据
  _players: [],
  _items: {},

  selectPlayers: function () {
    var domID = 'players';
    document.getElementById(domID).innerHTML = '';
    this._choosePeople(function (data) {
      this._players = data;
      this._renderPeopleList(domID, data);
    }.bind(this));
  },

  selectMarkers: function (id) {
    var domID = 'markers' + id;
    document.getElementById(domID).innerHTML = '';
    this._choosePeople(function (data) {
      this._items[id].markers = data;
      this._renderPeopleList(domID, data);
    }.bind(this));
  },

  _choosePeople: function (fn) {
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
  },

  _renderPeopleList: function (domID, data) {
    var ul;
    var i;
    var li;
    if (typeof domID === 'string') {
      ul = document.getElementById(domID);
    } else {
      ul = domID;
    }
    for (i = data.length - 1; i >= 0; i--) {
      li = document.createElement('li');
      li.innerText = data[i].name;
      ul.appendChild(li);
    }
  },

  displayAllItems: function () {
    document.querySelector('.all-items').classList.remove('hidden');
    scroll(0, 0);
  },

  hideAllItems: function () {
    document.querySelector('.all-items').classList.add('hidden');
  },

  selectItem: function (index) {
    var itemId = this._allItems[index].id;

    if (this._items[itemId] !== undefined) {
      return;
    }

    this._items[itemId] = {
      score: 0,
      markers: [],
    };

    this._renderSelectItem(index, 'add');
    this._renderItemDom(index);
    this.hideAllItems();
  },

  deleteItem: function (id, index) {
    var el = document.getElementById(id);
    document.querySelector('.pure-form > fieldset .select-items').removeChild(el);
    this._renderSelectItem(index);
  },

  _renderSelectItem: function (index, change) {
    var num = this._allItems.length - index;
    var el = document.querySelector('.all-items li:nth-child(' + num + ')');
    if (change === 'add') {
      return el.classList.add('selected');
    }
    return el.classList.remove('selected');
  },

  _renderItemDom: function (index) {
    var data = this._allItems[index];
    // TODO: 将 label 和 input 进行关联,
    //       https://www.w3.org/wiki/HTML/Elements/label
    // TODO: 处理项目被删除但是任务还存留项目 id 的情况.
    var el1 = document.createElement('fieldset');
    var el11 = document.createElement('legend');
    var el12 = document.createElement('label');
    var el13 = document.createElement('input');
    var el14 = document.createElement('div');
    var el15 = document.createElement('label');
    var el16 = document.createElement('ul');
    var el17 = document.createElement('button');
    var el18 = document.createElement('button');

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
    el17.setAttribute('onclick', 'app.selectMarkers(' + data.id + ')');
    el18.className = ('pure-button delete-item');
    el18.innerText = '删除该评分项';
    el18.setAttribute('onclick', 'app.deleteItem(\'' + el1.id + '\', ' + index + ')');
    el1.appendChild(el11);
    el1.appendChild(el12);
    el1.appendChild(el13);
    el1.appendChild(el14);
    el1.appendChild(el15);
    el1.appendChild(el16);
    el1.appendChild(el17);
    el1.appendChild(el18);
    return document.querySelector('.pure-form > fieldset .select-items').appendChild(el1);
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

  submit: function () {
    this._postData().then(function (json) {
      alert('插入成功');
      console.log(json);
    }).catch(function (err) {
      alert(err);
    });
  },

  _postData: function _postData () {
    var itemsID = Object.keys(this._items);
    var i;
    var v;
    for (i = itemsID.length - 1; i >= 0; i--) {
      v = itemsID[i];
      this._items[v].score = document.querySelector('[name=score' + v + ']').value;
    }
    return fetch('/api/v2/marks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Dingding-Auth': this.dingCode,
      },
      body: JSON.stringify({
        title: document.querySelector('[name=title]').value,
        players: this._players,
        items: this._items,
      }),
    }).then(function (response) {
      if (response.status !== 201) {
        throw new Error('查询失败');
      }
      return response.json();
    });
  },

    // 得到该任务的初始
  _getData: function (id) {
    return fetch('/api/v2/marks/' + id, {
      method: 'GET',
    }).then(function (response) {
      if (response.status !== 200) {
        throw new Error('查询失败');
      }
      return response.json();
    }).then(function (json) {
      if (json.error !== 0) {
        throw new Error('查询失败');
      }
      return json.result;
    });
  },

  // 另存为新任务
  saveAnother: function () {

  },

  render: function () {
    var getAllItems = this._getAllItems();

    var getData = this._getData(_id).then(function (data) {
      document.querySelector('[name=title]').value = data.title;
      this._players = data.players;
      this._items = data.items;
    }.bind(this));

    getData.then(function () {
      this._renderPeopleList('players', this._players);
    }.bind(this));

    // TODO: 改用事件机制或添加 Promise 的 polyfill 以提高兼容性.
    Promise.all([getAllItems, getData]).then(function () {
      var arr = this._itemsIndexArray();
      var i;
      var el;
      for (i = arr.length - 1; i >= 0; i--) {
        el = this._renderItemDom(arr[i]);
        this._renderExistingItems(el, this._items[this._allItems[arr[i]].id]);
      }
    }.bind(this));
  },

  _renderExistingItems: function (el, data) {
    var input = el.querySelector('input');
    var ul = el.querySelector('ul');
    input.value = data.score;
    this._renderPeopleList(ul, data.markers);
  },

  // TODO: 将所有 index 替换为 id 一以便下面函数的循环嵌套.
  //       目前之所以使用 index 是因为会方便 CSS 查找..
  _itemsIndexArray: function () {
    var itemsID = Object.keys(this._items);
    var itemsIndex;
    var allItems = this._allItems;

    itemsIndex = itemsID.map(function (id) {
      var index = allItems.findIndex(function (v) {
        if (v.id + '' === id) {
          return true;
        }
        return false;
      });
      return index;
    });

    return itemsIndex;
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
