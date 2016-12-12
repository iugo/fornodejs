const co = require('co');
const pool = require('../postgresql.js');
const dingUserInfo = require('../dingConfig.js').getUserInfo;

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

  deleteMark: co.wrap(function* (ctx, id) {
    const query = {
      text: 'DELETE FROM marks WHERE mark_id = $1;',
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

  marksList: co.wrap(function* (ctx) {
    const query = {
      text: 'SELECT mark_id AS id, title, create_timestamp AS "createTime"\
             FROM marks;'
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

  markInfo: co.wrap(function* (ctx, id) {
    const query = {
      text: 'SELECT title, players, items, create_timestamp AS "createTime"\
             FROM marks WHERE mark_id = $1;',
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

  updateMarkInfo: co.wrap(function* (ctx, id) {
    // TODO: 对请求中的各项数据进行验证(如非空).
    const b = ctx.request.body;
    const query = {
      text: 'UPDATE marks\
             SET title = $2, players = $3, items = $4\
             WHERE mark_id = $1;',
      values: [id, b.title, b.players, b.items]
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

  /*
   * 1. 查找该任务的所有信息 (查 marks 表)
   * 2. 查找该用户的 id (查钉钉服务器)
   * 3. 然后根据用户信息查找相应的评分项信息 (查 mark_items 表)
   * 4. 将数据一次性返回
   *
   * 执行顺序: 1 和 2 可以同步进行, 完毕后执行 3
   */
  getUserMarkInfo: co.wrap(function* (ctx, id) {
    const code = ctx.header['dingding-auth'];
    if (!code) {
      ctx.response.status = 401;
      ctx.body = '{"error": "没有 code 信息, 无法进行身份认证."}';
      return;
    }

    const userInfo = yield dingUserInfo(code);
    if (typeof userInfo.userid === 'undefined') {
      ctx.response.status = 403;
      ctx.body = '{"error": "钉钉身份认证出现异常."}';
      return;
    }

    // 用于跳过钉钉的测试数据
    // var userInfo = {
    //   userid: '054560181736092498'
    // };

    /*
     * Require parent variable: client
     * Require: id String
     * Return Promise Object
     */
    const getMarkInfo = (id) => {
      const query = {
        text: 'SELECT title, players, items, create_timestamp AS "createTime"\
              FROM marks WHERE mark_id = $1;',
        values: [id]
      };

      return client.query(query.text, query.values).then((res) => {
        if (res.rowCount === 0) {
          throw '查询失败, 可能因为没有找到评分任务';
        }
        return res.rows[0];
      });
    };

    /*
     * Require: items Object, userId String
     * Return Array[Number/String]
     * TODO: 目前返回值中的类型应该是字符串类型的数字, 需要和其他地方统一
     */
    let __tempMarker;
    const selectItems = (items, userId) => {
      const selectItems = [];
      for (const key in items) {
        if (items[key].markers.length) {
          items[key].markers.findIndex((v) => {
            if (v.emplId === userId) {
              __tempMarker = v;
              selectItems.push(key);
              return true;
            }
          });
        }
      }

      return selectItems;
    };

    /*
     * Require parent variable: client
     * Require: items Array
     * Return Array[Object]
     */
    const getItemsInfo = (items) => {
      let tempText = '';
      const query = {
        text: 'SELECT item_id AS id, name, description AS desc, grading\
               FROM mark_items WHERE item_id = $1' + tempText + ';',
        values: items
      };

      for (let i = 2, len = items.length + 1; i < len; i++) {
        tempText += ' OR item_id = $' + i;
      }

      return client.query(query.text, query.values).then((res) => {
        if (res.rowCount === 0) {
          throw '查询失败, 可能因为没有找到该项';
        }
        return res.rows;
      });
    };

    // ---

    const client = yield pool.connect();
    try {
      const markInfo = yield getMarkInfo(id);
      const userId = userInfo.userid;
      const usedItems = selectItems(markInfo.items, userId);

      if (usedItems.length === 0) {
        ctx.response.status = 403;
        throw '权限错误, 针对该评分任务没有评分权限';
      }

      const usedItemsInfo = yield getItemsInfo(usedItems);
      // TODO: 找到已经评分过的 items, 将相关信息填入

      for (let i = usedItemsInfo.length - 1; i >= 0; i--) {
        const id = usedItemsInfo[i].id;
        usedItemsInfo[i].score = markInfo.items[id].score;
      }

      const out = {
        error: 0,
        result: {
          title: markInfo.title,
          players: markInfo.players,
          marker: __tempMarker,
          items: usedItemsInfo,
          createTime: markInfo.createTime
        }
      };
      ctx.body = JSON.stringify(out);
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }
  }),

  userMarking: co.wrap(function* (ctx, id) {
    const code = ctx.header['dingding-auth'];
    if (!code) {
      ctx.response.status = 401;
      ctx.body = '{"error": "没有 code 信息, 无法进行身份认证."}';
      return;
    }

    // TODO: 处理错误
    // 钉钉出错, 提示 {"errcode":40078,"errmsg":"不存在的临时授权码"}
    // 可能因为两次调用 dingUserInfo 造成.
    // const userInfo = yield dingUserInfo(code);
    // console.log(userInfo);
    // if (typeof userInfo.userid === 'undefined') {
    //   ctx.response.status = 403;
    //   ctx.body = '{"error": "钉钉身份认证出现异常."}';
    //   return;
    // }

    // TODO: 从 marks 表中验证 marker 身份
    // const marker = {
    //   name: '未命名用户',
    //   emplId: userInfo.userid
    // };

    const timestamp = (Date.now() + '').slice(0, -3);

    const b = ctx.request.body;

    const jointQuery = () => {
      const pushValues = (item) => {
        tempArr.push(item.id, item.score, item.total);
      };

      const tempArr = [id, b.player, b.marker, timestamp];
      pushValues(b.items[0]);
      let tempText = '($1, $2, $3, $4, $5, $6, $7)';

      for (let i = 1, len = b.items.length; i < len; i++) {
        const num = tempArr.length;
        const v1 = ', $' + (num + 1);
        const v2 = ', $' + (num + 2);
        const v3 = ', $' + (num + 3);
        tempText += ', ($1, $2, $3, $4' + v1 + v2 + v3 + ')';
        pushValues(b.items[i]);
      }

      return {
        text: 'INSERT INTO mark_results\
               (mark_id, player, marker, mark_timestamp,\
               item_id, score, total_score) VALUES ' + tempText + ';',
        values: tempArr
      };
    };

    const query = jointQuery();

    var client = yield pool.connect();
    try {
      var res = yield client.query(query.text, query.values);
      if (res.rowCount === 0) {
        throw '连接成功, 但是操作失败';
      }
      console.log(res);
      ctx.response.status = 201;
      ctx.length = 0;
    } catch (err) {
      ctx.body = '{"error": "失败 ' + err + '"}';
    } finally {
      client.release();
    }
  })

};
