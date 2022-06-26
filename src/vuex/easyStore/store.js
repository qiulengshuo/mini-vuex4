import { reactive } from "vue"
import { storeKey } from "./injectKey"
import { forEachValue } from "./until"

export default class Store {
  constructor(options) {
    const store = this
    // ---state---
    // store._state.data
    // 不用 {data} 包裹，如果整个 state 替换，不会触发更新，并且需要频繁添加 reactive。
    store._state = reactive({ data: options.state })

    // ---getters---
    // API: store.getters
    // 用 get 是因为不能写死数据
    const _getters = options.getters
    store.getters = {}
    forEachValue(_getters, function (fn, key) {
      Object.defineProperty(store.getters, key, {
        enumerable: true,
        get: () => fn(store.state)
      })
    })

    // ---mutations---
    // ---actions---
    store._mutations = Object.create(null)
    store._actions = Object.create(null)
    const _mutations = options.mutations
    const _actions = options.actions
    forEachValue(_mutations, (mutation, key) => {
      store._mutations[key] = (payload) => {
        mutation.call(store, store.state, payload)
      }
    })
    forEachValue(_actions, (action, key) => {
      store._actions[key] = (payload) => {
        action.call(store, store, payload)
      }
    })
  }
  // API: store.state
  get state () {
    return this._state.data
  }
  // API: store.commit(type, payload)
  commit = (type, payload) => {
    this._mutations[type](payload)
  }
  // API: store.dispatch(type, payload)
  dispatch = (type, payload) => {
    this._actions[type](payload)
  }
  install (app, injectKey) {
    // 通过 useStore 注入 store 实例。
    app.provide(injectKey || storeKey, this)
    // 通过 $store 调用 store 实例。
    app.config.globalProperties.$store = this
  }
}
