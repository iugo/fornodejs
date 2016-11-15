const co = require('co');
const pool = require('./postgresql.js');

module.exports = {
  markInfo: co.wrap(function* (ctx, markId) {
    const query = {
      text: 'SELECT * FROM mark WHERE mark_id = $1',
      values: [markId]
    }
    const res = yield new Promise((resolve, reject) => {
      pool.connect((err, client, done) => {
        if (err) { return console.error('error fetching client from pool', err) }
        client.query(query).then(res => {
          if (err) { return console.error(err); }
          if (res.rowCount > 0) {
            return res.rows[0]
          }
          done()
          reject('查到的数据有误')
        })
        // .then(rows => {
        //   client.query({
        //     text: '',
        //     values: []
        //   }).then(res => {
        //     done()
        //   })
        // })
        .catch(err => {
          done()
          console.log(err)
        })
      });
      setTimeout(() => {
        reject('超时, 请查看刚才是否已经操作成功')
      }, 5000);
    }).catch(function (err) {
      return '用户访问出错: ' + err
    })

    console.log(res)

    ctx.render('mark', {
      title: '查看评分',
      text: '页面载入结束',
      config: yield require('./dingConfig.js')(ctx.href)
    })
  })
}
