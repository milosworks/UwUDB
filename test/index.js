const Utils = require('../lib/Util/Utils')

const obj = {}

Utils.parseObj(obj, Utils.parseKey('yet.another.ola'), 120)

console.log(obj)