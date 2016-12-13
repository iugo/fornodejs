/* global dd _config */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  _dataHandled: {},

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

  // https://jsbin.com/yivodofafo/4/
  _dataHandle: function (data) {
    var res = {};
    // 👇访问并修改了外部变量 res
    function pushPeople (people) {
      var newPeople;
      if (typeof res[people.emplId] === 'undefined') {
        newPeople = people;
        newPeople.finalScore = 0;
        newPeople.items = {};
        res[people.emplId] = newPeople;
      }
      return res[people.emplId];
    }
    // 👇修改了指针 items
    function pushItem (item, items) {
      if (typeof items[item] === 'undefined') {
        items[item] = {
          average: 0,
          total: 0,
          detail: [],
        };
      }
      return items[item];
    }
    // 👇修改了指针 item
    function pushScore (score, marker, item) {
      var newMarker = marker;
      newMarker.score = score;
      item.detail.push(newMarker);
      item.total += score;
      item.average = Math.floor(item.total / item.detail.length);
      // TODO: 平均数计算效率优化, 在数据完全加载前的计算都是无用的, 在加载后执行一次即可
    }
    function finalScore (people) {
      var final = 0;
      var arr = Object.keys(people.items);
      arr.forEach(function (itemId) {
        var item = people.items[itemId];
        final += item.average;
      });
      return final;
    }
    data.forEach(function (v) {
      var people = pushPeople(v.player);
      var item = pushItem(v.item_id, people.items);
      pushScore(v.score, v.marker, item);
      people.finalScore = finalScore(people);
      // TODO: 总分计算效率优化, 在数据完全加载前的计算都是无用的, 在加载后执行一次即可
    }, this);

    return res;
  },

  _renderPeople: function (people) {
    var el = document.createElement('tr');
    var el1 = document.createElement('td');
    var el2 = document.createElement('td');
    var el3 = document.createElement('td');
    var el4 = document.createElement('td');
    el1.innerText = people.name;
    el3.innerText = '总计';
    el4.innerText = people.finalScore + '分';
    el.appendChild(el1);
    el.appendChild(el2);
    el.appendChild(el3);
    el.appendChild(el4);
    return el;
  },

    _renderItem: function (item) {
      var el = document.createElement('tr');
      var el1 = document.createElement('td');
      var el2 = document.createElement('td');
      var el3 = document.createElement('td');
      var el4 = document.createElement('td');
      el1.innerText = item.name;
      el2.innerText = '项目名称';
      el4.innerText = item.average + '分';
      el.appendChild(el1);
      el.appendChild(el2);
      el.appendChild(el3);
      el.appendChild(el4);
      return el;
    },

  render: function () {
    var text = 'JSONString';
    this._dataHandled = this._dataHandle(JSON.parse(text).result);

    var people = this._dataHandled['0peopleId'];

    var peopleDom = this._renderPeople(people);
    document.querySelector('tbody').appendChild(peopleDom);

    this._renderItem(people.items);
  },
};

document.addEventListener('DOMContentLoaded', function () {
  app.render();
});
