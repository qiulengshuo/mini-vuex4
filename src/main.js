import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

// store 可以传递 key
// use(store, 'xxx')
// 使用 store 的时候，直接 useStore('xxx')
createApp(App).use(store).mount('#app')
