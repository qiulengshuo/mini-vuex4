import { forEachValue } from '../until'
import Module from './module'

// {
//   root: {
//     _raw: {},
//     state: {},
//     children: {
//       aCount: {
//         _raw: {},
//         state: {},
//         children: {
//           cCount: {
//             _raw: {},
//             state: {},
//             children: {}
//           }
//         }
//       },
//       bCount: {
//         _raw: {},
//         state: {},
//         children: {}
//       }
//     }
//   }
// }

export default class ModuleCollection {
  constructor(rootModule) {
    this.root = null
    this.register(rootModule, [])
  }
  register (rawModule, path) {
    // newModule 用于整合单个模块
    const newModule = new Module(rawModule)
    if (path.length === 0) {
      // 根模块
      this.root = newModule
    } else {
      // 非根模块

      // [aCount, cCount]
      // 找到 父模块 添加到 模块module 的 children 属性上。
      // parent -> aCount Module
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }

    // 遍历子模块，去递归注册。
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(rawChildModule, path.concat(key))
      })
    }
    return newModule
  }
}