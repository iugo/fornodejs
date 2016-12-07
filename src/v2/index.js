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

  }),

  markItemsList: co.wrap(function* (ctx) {
    const query = {
      text: 'SELECT item_id AS id, name, description AS desc, grading\
             FROM mark_items;'
    };
    const client = yield pool.connect();
    try {
      // TODO: 进行超时处理
      const res = yield client.query(query.text);
      if (res.rowCount === 0) {
        throw '连接成功, 但是操作失败';
      }
      const out = {
        error: 0,
        result: res.rows
      };
      ctx.body = JSON.stringify(out);
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }
  }),

  deleteMarkItem: co.wrap(function* (ctx, id) {
    const query = {
      text: 'DELETE FROM mark_items WHERE item_id = $1;',
      values: [id]
    };
    const client = yield pool.connect();
    try {
      // TODO: 进行超时处理
      const res = yield client.query(query.text, query.values);
      if (res.rowCount === 0) {
        throw '连接成功, 但是操作失败';
      }
      ctx.response.status = 204;
      ctx.length = 0;
      // ctx.body = JSON.stringify(out);
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }
  }),

  markItem: co.wrap(function* (ctx, id) {
    const query = {
      text: 'SELECT item_id AS id, name, description AS desc, grading\
             FROM mark_items WHERE item_id = $1;',
      values: [id]
    };
    const client = yield pool.connect();
    try {
      // TODO: 进行超时处理
      const res = yield client.query(query.text, query.values);
      if (res.rowCount === 0) {
        throw '查询失败, 可能因为没有找到该项';
      }
      const out = {
        error: 0,
        result: res.rows[0]
      };
      ctx.body = JSON.stringify(out);
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }
  }),

  updateMarkItem: co.wrap(function* (ctx, id) {
    // TODO: 对请求中的各项数据进行验证(如非空).
    const b = ctx.request.body;
    const query = {
      text: 'UPDATE mark_items SET name = $2, description = $3,\
             grading = $4 WHERE item_id = $1;',
      values: [id, b.name, b.desc, b.grading]
    };
    var client = yield pool.connect();
    try {
      var res = yield client.query(query.text, query.values);
      if (res.rowCount === 0) {
        throw '连接成功, 但是操作失败';
      }
      console.log(res);
      ctx.response.status = 204;
      ctx.length = 0;
      // TODO: 返回适当的服务端信息
      // ctx.body = '{"error": 0,"result": {"id": ""}}';
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }

  }),

  newMark: co.wrap(function* (ctx) {
    // TODO: 对请求中的各项数据进行验证(如非空).
    const b = ctx.request.body;
    const players = JSON.stringify(b.players);
    const items = JSON.stringify(b.items);
    const timestamp = (Date.now() + '').slice(0, -3);
    const query = {
      text: 'INSERT INTO marks (title, players, items, create_timestamp)\
             VALUES ($1, $2, $3, $4) RETURNING mark_id AS "markId";',
      values: [b.title, players, items, timestamp]
    };

    var client = yield pool.connect();
    try {
      var res = yield client.query(query.text, query.values);
      if (res.rowCount === 0) {
        throw '连接成功, 但是操作失败';
      }
      console.log(res);
      ctx.response.status = 201;
      ctx.body = '{"error": 0,"result": {"id": "' + res.rows[0].markId + '"}}';
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }

  }),

};
