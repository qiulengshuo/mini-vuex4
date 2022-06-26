// 工具函数

// 遍历对象，传递 fn
export function forEachValue (obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key))
}

// 判断 promise
export function isPromise (val) {
  return val && typeof val.then === 'function'
}