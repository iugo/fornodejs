/* global dd _config _id */

// 无法使用 ES2015 箭头函数因为 IE11, Safari9, AndroidBrowser4.4 均不支持

var app = {
  _dataHandled: {},

  _getData: function _getData (id) {
    return fetch('/api/v2/results/' + id, {
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
    function pushItem (item, itemName, items) {
      if (typeof items[item] === 'undefined') {
        items[item] = {
          name: itemName,
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
      var item = pushItem(v.itemId, v.itemName, people.items);
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

  _renderItem: function (item, id) {
    var el = document.createElement('tr');
    var el1 = document.createElement('td');
    var el2 = document.createElement('td');
    var el3 = document.createElement('td');
    var el4 = document.createElement('td');
    // el1.innerText = people.name;
    el2.innerText = item.name;
    el4.innerText = item.average + '分';
    el.appendChild(el1);
    el.appendChild(el2);
    el.appendChild(el3);
    el.appendChild(el4);
    return el;
  },

  _renderBaseResult: function (result) {
    var el = document.createElement('tr');
    var el1 = document.createElement('td');
    var el2 = document.createElement('td');
    var el3 = document.createElement('td');
    var el4 = document.createElement('td');
    // el1.innerText = people.name;
    el3.innerText = result.name;
    el4.innerText = result.score + '分';
    el.appendChild(el1);
    el.appendChild(el2);
    el.appendChild(el3);
    el.appendChild(el4);
    return el;
  },

  _renderItems: function (items, peopleDom) {
    var keys = Object.keys(items);
    keys.forEach(function (key) {
      var itemDom = this._renderItem(items[key], key);
      peopleDom.parentNode.insertBefore(itemDom, peopleDom.nextSibling);
      this._renderBaseResults(items[key].detail, itemDom);
    }, this);
  },

  _renderBaseResults: function (results, itemDom) {
    results.forEach(function (result) {
      var resultDom = this._renderBaseResult(result);
      itemDom.parentNode.insertBefore(resultDom, itemDom.nextSibling);
    }, this);
  },

  render: function () {
    this._getData(_id).then(function (text) {
      var data = this._dataHandle(text.result);
      var keys = Object.keys(data);
      keys.forEach(function (key) {
        var people = data[key];
        var peopleDom = this._renderPeople(people);
        document.querySelector('tbody').appendChild(peopleDom);
        this._renderItems(people.items, peopleDom);
      }, this);
    }.bind(this));
  },
};

document.addEventListener('DOMContentLoaded', function () {
  app.render();
});
