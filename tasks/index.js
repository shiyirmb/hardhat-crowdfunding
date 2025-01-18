// 我们做的所有事情都可以写成task，让代码更加标准化，页更利于用户使用。
// tasks 不是一个必须的，但是在一个大项目中，脚本文件会变得比较臃肿，而task会比较灵活。
exports.deployTask = require('./deploy')
exports.interactTask = require('./interact')

exports.deployTaskCFT = require('./deploy-cft')
exports.interactTaskCFT = require('./interact-cft')