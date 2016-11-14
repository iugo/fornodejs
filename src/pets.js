var db = {
  tobi: { name: 'tobi', species: 'ferret' },
  loki: { name: 'loki', species: 'ferret' },
  jane: { name: 'jane', species: 'ferret' }
};

const co = require('co');

const myConfig = {
  name: 'Jim'
}

const Common = function (config) {
  this.config = config
  return co.wrap(function* (ctx) {
    config = this.config

    if (config) {
      ctx.body = '名字是: ' + config.name
    } else {
      ctx.body = '部分出错'
    }

  }.bind(this));
}

module.exports = {
  // list: (ctx) => {
  //   var names = Object.keys(db);
  //   ctx.body = 'pets: ' + names.join(', ');
  // },
  list: new Common(myConfig),

  show: (ctx, name) => {
    var pet = db[name];
    if (!pet) return ctx.throw('cannot find that pet', 404);
    ctx.body = pet.name + ' is a ' + pet.species;
  }
};
