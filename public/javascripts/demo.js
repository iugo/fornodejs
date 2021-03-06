/**
 * dd 来自钉钉的 API
 * _config comes from server-side template.
 */

dd.config({
  agentId: _config.agentId,
  corpId: _config.corpId,
  timeStamp: _config.timeStamp,
  nonceStr: _config.nonceStr,
  signature: _config.signature,
  jsApiList: ['device.notification.confirm',
    'device.notification.alert',
    'device.notification.prompt',
    'biz.chat.chooseConversation',
    'biz.contact.complexChoose',
    'biz.contact.choose',
    'biz.ding.post'],
});

dd.ready(function () {
  var head = document.querySelector('h1');
  alert('dd ready');
  head.innerHTML += ' It rocks!';

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

dd.error(function (err) {
  alert('dd error: ' + JSON.stringify(err));
});

document.addEventListener('DOMContentLoaded', function (event) {
  document.querySelector('input[type=submit]').onclick = submit;
});

function sendMessage(people, text, link) {
  var config = {
    users: people,
    corpId: _config.corpId, // 企业id
    type: 2, // 钉类型 1：image  2：link
    alertType: 2,
    // alertDate: {"format":"yyyy-MM-dd HH:mm","value":"2016-11-07 17:00"},
    text: text, // 消息
    onSuccess: function () {
      alert('已发送');
    },
    onFail: function () {
      alert('消息发送失败');
    },
  };
  link ? config.attachment = link : config.type = 0;
  console.log('将要发的 Ding 类型为: ' + config.type);
  dd.biz.ding.post(config);
}

function choosePeople (key) {
  dd.biz.contact.choose({
    startWithDepartmentId: 0,
    multiple: true, // 是否多选： true多选 false单选； 默认true
    users: [], // 默认选中的用户列表，userid；成功回调中应包含该信息
    corpId: _config.corpId,
    onSuccess: function (data) {
      sessionStorage.setItem(key, JSON.stringify(data));
      return alert('选人成功, 请继续完成其他操作');
      // return alert('已完成选人: ' + sessionStorage.getItem(key))
      // var theUsers = JSON.parse(sessionStorage.getItem('selectedPeople')).map(function (val) {
      //     return val.emplId
      // })
      // alert(JSON.stringify(theUsers) || '已选中的用户出错')
      // sendMessage(theUsers, '您已经获得评分')
    },
    onFail: function (err) {
      alert('出错了' + JSON.stringify(err));
    },
  });
}

function submit(event) {
  var data = 'title=' + document.querySelector('input[name=title]').value;
  data += '&description=' + document.querySelector('textarea').value;
  data += '&itemsId=' + document.querySelector('input[name=itemsId]').value;
  data += '&markers=' + sessionStorage.getItem('markers');
  data += '&berateds=' + sessionStorage.getItem('berateds');

  alert('数据获取正常' + data)

  fetch(event.target.dataset.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data,
  }).then(function (response) {
    return response.json();
  }).then(function (json) {
    // alert(JSON.stringify(json))
    var markUrl = '/mark/' + json.result.markId;
    console.log(json);
    var theUsers = JSON.parse(sessionStorage.getItem('markers')).map(function (val) {
      return val.emplId;
    });
    sendMessage(theUsers, '请进行评分', {
      title: '请进行评分',
      url: location.origin + markUrl,
      image: 'http://ww2.sinaimg.cn/small/62763bfdjw1f9stnfam33j20go0aiab3.jpg',
      text: '请进行评分',
    });
  }).catch(function (err) {
    alert(err);
    console.log(err);
  });
}
