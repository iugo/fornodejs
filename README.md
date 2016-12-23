# 评分模块 - 基于钉钉

## 技术栈

- Node.js ^6.9.1
  - koa2
    - koa-bodyparser 格式化 Request Body
    - koa-compress 压缩 Response Body
    - koa-static 处理静态文件
    - koa-route 路由
  - [pug] 之前名字叫作 jade
    - koa-pug 与 koa 协同使用
  - [co] 实现类似 async/await 的流程控制
  - [pg] PostgreSQL 客户端
    文档比较分散, 多数用法 Promise 和 callback 均可使用.
- PostgreSQL 9.5.5

[co]: https://github.com/tj/co
[pg]: https://github.com/brianc/node-postgres
[pug]: https://pugjs.org/

## 已经计划

* 网络错误处理
  目前如果网络出错, 则界面会一直停留在 Loading 层, 没有给用户进一步的操作提示.
  第一步, 需要增加一个最大延迟时间, 之后给用户延迟提醒, 自动刷新页面.
  第二步, 根据错误信息进行不同的行为, 并返回给用户适当的信息.
  目前有待处理的页面为 "任务编辑页".

## 已知问题

* 修改任务信息时, 只能保存对标题的修改 ⭐️️️️️️️️✨★
* 检查这几项是否进行过评分, 避免重复评分

#### koa2 中间件
https://github.com/koajs/bodyparser/tree/next
