/**
 * Created by liqiao on 8/10/15.
 */

/**
 * _config comes from server-side template. see views/index.jade
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
        'biz.ding.post']
});

dd.ready(function() {
    alert('dd ready');

    // document.addEventListener('pause', function() {
    //     alert('pause');
    // });

    // document.addEventListener('resume', function() {
    //     alert('resume');
    // });

    var head = document.querySelector('h1');
    head.innerHTML = head.innerHTML + ' It rocks!';

    // dd.device.notification.alert({
    //     message: 'dd.device.notification.alert',
    //     title: 'This is title',
    //     buttonName: 'button',
    //     onSuccess: function(data) {
    //         alert('win: ' + JSON.stringify(data));
    //     },
    //     onFail: function(err) {
    //         alert('fail: ' + JSON.stringify(err));
    //     }
    // });

    dd.biz.contact.complexChoose({
      startWithDepartmentId: 0, //-1表示从自己所在部门开始, 0表示从企业最上层开始，其他数字表示从该部门开始
      selectedUsers: [], //预选用户
      corpId: _config.corpId, //企业id
      onSuccess: function(data) {
        sessionStorage.setItem('selectedPeople', JSON.stringify(data));
        alert('已完成选人')

        alert('查看 ' + sessionStorage.getItem('selectedPeople'))
        var theUsers = JSON.parse(sessionStorage.getItem('selectedPeople')).users.map(function (val) {
            return val.emplId
        })
        alert(JSON.stringify(theUsers) || '已选中的用户出错')
        sendMessage(theUsers, '您已经获得评分')
      },
      onFail : function(err) {
        alert('出错了' + JSON.stringify(err))
      }
    });

    function sendMessage (people, text) {
        dd.biz.ding.post({
            // users : ['100', '101'],//用户列表，工号
            users : people,
            corpId: _config.corpId, //企业id
            type: 0, //钉类型 1：image  2：link
            alertType: 2,
            // alertDate: {"format":"yyyy-MM-dd HH:mm","value":"2016-11-07 17:00"},
            text: text, //消息
            onSuccess : function() {
                alert('已发送')
            },
            onFail : function() {
                alert('消息发送失败')
            }
        })
    }

});

dd.error(function(err) {
    alert('dd error: ' + JSON.stringify(err));
});
