const co = require('co');
const pool = require('../postgresql.js');

module.exports = {
  newMarkItem: co.wrap(function* (ctx) {
    // TODO: 对请求中的各项数据进行验证(如非空).
    const b = ctx.request.body;
    const query = {
      text: 'INSERT INTO mark_items (name, description, grading)\
             VALUES ($1, $2, $3) RETURNING item_id AS "itemId";',
      values: [b.name, b.desc, b.grading]
    };

    var client = yield pool.connect();
    try {
      var res = yield client.query(query.text, query.values);
      if (res.rowCount === 0) {
        throw '连接成功, 但是操作失败';
      }
      console.log(res);
      ctx.response.status = 201;
      ctx.body = '{"error": 0,"result": {"id": "' + res.rows[0].itemId + '"}}';
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }

  })
};
