import { reactive } from "vue"
import { storeKey } from "./injectKey"
import ModuleCollection from "./module/module-collection"
import { forEachValue, isPromise } from "./until"

// 获取 module 下面 state
function getNestedState (state, path) {
  return path.reduce((state, key) => state[key], state)
}

function installModule (store, rootState, path, module) {
  // 数组为空，为 根module
  let isRoot = !path.length

  // 安装 state
  // state: {
  //   xxx: xxx,
  //   aCount: {
  //     xxx: xxx
  //   }
  // }
  if (!isRoot) {
    let parentState = path.slice(0, -1).reduce((state, key) => {
      return state[key]
    }, rootState)
    parentState[path[path.length - 1]] = module.state
  }

  // 安装 getters
  module.forEachGetter((getter, key) => {
    store._wrappedGetters[key] = () => {
      return getter(getNestedState(store.state, path))
    }
  })

  // 安装 mutations
  module.forEachMutation((mutation, key) => {
    const entry = store._mutations[key] || (store._mutations[key] = [])
    entry.push((payload) => {
      mutation.call(store, getNestedState(store.state, path), payload)
    })
  })

  // 安装 actions
  module.forEachAction((action, key) => {
    const entry = store._actions[key] || (store._actions[key] = [])
    entry.push((payload) => {
      let res = action.call(store, store, payload)
      if (!isPromise(res)) {
        return Promise.resolve(res)
      }
      return res
    })
  })

  // 递归遍历子模块的 state
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child)
  })
}

function resetStoreState (store, state) {
  store._state = reactive({ data: state })

  const wrappedGetters = store._wrappedGetters
  store.getters = {}
  forEachValue(wrappedGetters, (getter, key) => {
    Object.defineProperty(store.getters, key, {
      enumerable: true,
      get: getter
    })
  })
}

export default class Store {
  constructor(options) {
    const store = this

    // 收集整合各个模块 
    // store: {
    //   _modules: {
    //     root: {}
    //   }
    // }
    store._modules = new ModuleCollection(options)

    store._wrappedGetters = Object.create(null)
    store._mutations = Object.create(null)
    store._actions = Object.create(null)

    const state = store._modules.root.state
    // 安装模块
    installModule(store, state, [], store._modules.root)
    // 设置 store._state 和 store.getters
    resetStoreState(store, state)
    console.log(store)
  }
  // API: store.state
  get state () {
    return this._state.data
  }
  // API: store.commit(type, payload)
  commit = (type, payload) => {
    const entry = this._mutations[type] || []
    entry.forEach(handler => handler(payload))
  }
  // API: store.dispatch(type, payload)
  dispatch = (type, payload) => {
    const entry = this._actions[type] || []
    return Promise.all(entry.map(handler => handler(payload)))
  }
  install (app, injectKey) {
    // 通过 useStore 注入 store 实例。
    app.provide(injectKey || storeKey, this)
    // 通过 $store 调用 store 实例。
    app.config.globalProperties.$store = this
  }
}
