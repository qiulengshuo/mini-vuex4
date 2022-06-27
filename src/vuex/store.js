import { reactive, watch } from "vue"
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

  const namespaced = store._modules.getNamespaced(path)

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
    store._withCommit(() => {
      parentState[path[path.length - 1]] = module.state
    })
  }

  // 安装 getters
  module.forEachGetter((getter, key) => {
    store._wrappedGetters[namespaced + key] = () => {
      return getter(getNestedState(store.state, path))
    }
  })

  // 安装 mutations
  module.forEachMutation((mutation, key) => {
    const entry = store._mutations[namespaced + key] || (store._mutations[namespaced + key] = [])
    entry.push((payload) => {
      mutation.call(store, getNestedState(store.state, path), payload)
    })
  })

  // 安装 actions
  module.forEachAction((action, key) => {
    const entry = store._actions[namespaced + key] || (store._actions[namespaced + key] = [])
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

  // 严格模式下，监控 state 的变化，只有触发 mutation 的同步操作，才不断言。
  if (store.strict) {
    enableStrictMode(store)
  }
}

function enableStrictMode (store) {
  watch(() => store._state.data, () => {
    debugger
    console.assert(store._commiting, 'do not mutate vuex store state outside mutation handlers or async')
  }, { deep: true, flush: 'sync' })
}

export default class Store {
  // 用于检查当前的 mutation 是不是同步的
  _withCommit (fn) {
    const commiting = this._commiting
    this._commiting = true
    fn()
    this._commiting = commiting
  }
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

    // 开启严格模式
    this.strict = options.strict || false
    // 只允许同步的 mutation
    this._commiting = false

    const state = store._modules.root.state
    // 安装模块
    installModule(store, state, [], store._modules.root)
    // 设置 store._state 和 store.getters
    resetStoreState(store, state)

    store._subscribes = []
    options.plugins.forEach(plugin => plugin(store))

    
  }
  subscribe (fn) {
    this._subscribes.push(fn)
  }
  replaceState (newState) {
    // 严格模式下，不能直接修改 state
    // 只能通过强制把 this._commiting 设为 true
    this._withCommit(() => {
      this._state.data = newState
    })
  }
  registerModule (path, rawModule) {
    const store = this
    if (typeof path === 'string') {
      path = [path]
    }
    // 生成 新模块
    const newModule = store._modules.register(rawModule, path)
    // 安装 state getters mutations actions
    installModule(store, store.state, path, newModule)
    // 重置 getters
    resetStoreState(store, store.state)
  }
  // API: store.state
  get state () {
    return this._state.data
  }
  // API: store.commit(type, payload)
  commit = (type, payload) => {
    const entry = this._mutations[type] || []
    this._withCommit(() => {
      entry.forEach(handler => handler(payload))
    })
    this._subscribes.forEach(sub => sub({ type, payload }, this.state))
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
