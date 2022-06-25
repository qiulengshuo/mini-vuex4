import Store from "./store"
import { useStore } from "./injectKey"

// store/index.js createStore({ })
function createStore (options) {
  return new Store(options)
}

// vuex 入口文件
export {
  createStore,
  useStore
}
