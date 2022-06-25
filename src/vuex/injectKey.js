import { inject } from "vue"

// 默认导入的时候，使用 store 这个 key
// provide 的时候，也是默认传入这个 key
export const storeKey = 'store'
export function useStore (injectKey = null) {
  return inject(injectKey !== null ? injectKey : storeKey)
}