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
  _items: [],
  _marker: {},

  _getData: function () {
    return fetch('/api/v2/marks/' + _id + '/user', {
      method: 'GET',
      headers: {
        'Dingding-Auth': this.dingCode,
      },
    }).then(function (response) {
      if (response.status !== 200) {
        throw new Error('出错了' + response.status);
      }
      return response.json();
    }).then(function (json) {
      return json.result;
    });
  },

  _renderFieldsetDom: function (player) {
    var el = document.createElement('fieldset');
    var el1 = document.createElement('legend');
    var el2 = document.createElement('input');
    el.id = 'player' + player.emplId;
    el1.setAttribute('class', 'top-space');
    el1.innerText = '为 ' + player.name + ' 评分';
    el2.setAttribute('class', 'pure-button pure-button-primary');
    el2.setAttribute('type', 'submit');
    el2.setAttribute('onclick', 'app.submit(\'' + player.emplId + '\');');
    el2.value = '提交';
    el.appendChild(el1);

    var i;
    for (i = 0; i < this._items.length; i++) {
      el.appendChild(this._renderItemDom(this._items[i]));
    }

    el.appendChild(el2);
    return el;
  },

  _renderItemDom: function (item) {
    var el = document.createElement('div');
    var el1 = document.createElement('h4');
    var el11 = document.createElement('label');
    var el2 = document.createElement('span');
    var el3 = document.createElement('select');
    var el31 = document.createElement('option');
    var el32 = document.createElement('option');
    var el33 = document.createElement('option');
    var el34 = document.createElement('option');
    var el35 = document.createElement('option');
    var el36 = document.createElement('option');
    var el37 = document.createElement('option');

    el11.innerText = item.name;
    el2.setAttribute('class', 'grading');
    el2.innerText = item.grading;
    el3.setAttribute('name', 'item' + item.id);
    el31.innerText = '请选择评分';
    el32.innerText = '优秀';
    el33.innerText = '良好';
    el34.innerText = '合格';
    el35.innerText = '一般';
    el36.innerText = '较差';
    el37.innerText = '非常差';
    el32.setAttribute('value', '10');
    el33.setAttribute('value', '8');
    el34.setAttribute('value', '6');
    el35.setAttribute('value', '4');
    el36.setAttribute('value', '2');
    el37.setAttribute('value', '0');

    el3.appendChild(el31);
    el3.appendChild(el32);
    el3.appendChild(el33);
    el3.appendChild(el34);
    el3.appendChild(el35);
    el3.appendChild(el36);
    el3.appendChild(el37);
    el1.appendChild(el11);
    el.appendChild(el1);
    el.appendChild(el2);
    el.appendChild(el3);

    return el;
  },

  _renderDom: function () {
    var i;
    var dom;
    for (i = this._players.length - 1; i >= 0; i--) {
      dom = this._renderFieldsetDom(this._players[i]);
      document.querySelector('.pure-form.pure-form-stacked').appendChild(dom);
    }
  },

  render: function () {
    this._getData()
    .then(function (res) {
      if (res.players.length === 0) {
        throw new Error('异常错误, 没有找到被评分人');
      }
      document.querySelector('h2').innerText = res.title;
      this._players = res.players;
      this._items = res.items;
      this._marker = res.marker;
    }.bind(this))
    .then(this._renderDom.bind(this))
    .catch(function (err) {
      alert(err);
    });
  },

  submit: function (id) {
    var body = {
      player: this._players.find(function (player) {
        if (player.emplId === id) {
          return true;
        }
        return false;
      }),
      marker: this._marker,
    };
    body.items = this._items.map(function (item) {
      var peopleDom = document.getElementById('player' + id);
      var itemDom = peopleDom.querySelector('[name=item' + item.id + ']');
      return {
        id: item.id + '',
        score: Math.floor((item.score * itemDom.value) / 10),
        total: parseInt(item.score, 10),
      };
    }, this);

    alert(JSON.stringify(body));

    fetch('/api/v2/results/' + _id, {
      method: 'POST',
      headers: {
        'Dingding-Auth': this.dingCode,
      },
      body: JSON.stringify(body),
    }).then(function (response) {
      if (response.status !== 201) {
        throw new Error('数据提交错误, 返回状态为 ' + response.status);
      }
      alert('提交成功');
    }).catch(function(err) {
      alert('出错了: ' + err);
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
      app.render();
    },
    onFail: function (err) {
      alert('无法获得 code: ' + JSON.stringify(err));
    },
  });
});
