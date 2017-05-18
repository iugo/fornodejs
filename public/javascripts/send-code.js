dd.config({
  agentId: _config.agentId,
  corpId: _config.corpId,
  timeStamp: _config.timeStamp,
  nonceStr: _config.nonceStr,
  signature: _config.signature,
});

dd.ready(function () {
  dd.runtime.permission.requestAuthCode({
    corpId: _config.corpId,
    onSuccess: function (result) {
      alert('自动登入 code 为: ' + JSON.stringify(result));
      location.href = '/api/v2/login/' + result.code + '/' + _codeBaseKey
    },
    onFail: function (err) {
      alert('无法获得 code: ' + JSON.stringify(err));
    },
  });
});

dd.error(function (err) {
  alert('dd error: ' + JSON.stringify(err));
});
