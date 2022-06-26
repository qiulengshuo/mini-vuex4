import { forEachValue } from "../until"

// {
//   _raw,
//   state,
//   _children
// }

export default class Module {
  constructor(rawModule) {
    this._raw = rawModule
    this.state = rawModule.state
    this._children = {}
  }
  // 添加 children  
  addChild (key, module) {
    this._children[key] = module
  }
  // 查看 children
  getChild (key) {
    return this._children[key]
  }
  forEachChild (fn) {
    forEachValue(this._children, fn)
  }
  forEachGetter (fn) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, fn)
    }
  }
  forEachMutation (fn) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, fn)
    }
  }
  forEachAction (fn) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, fn)
    }
  }
}