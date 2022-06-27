import { createStore } from '@/vuex'

// 持久化存储 vuex:state
function customPersistence (store) {
  // 每次刷新，重置 state
  let local = localStorage.getItem('VueX:State')
  if (local) {
    store.replaceState(JSON.parse(local))
  }
  // 订阅函数
  store.subscribe((mutation, state) => {
    localStorage.setItem('VueX:State', JSON.stringify(state))
  })
}

const store = createStore({
  // 当 mutation 触发之后，会执行插件的订阅函数
  plugins: [
    customPersistence
  ],
  // 开启严格模式，不允许直接修改 store.state，只能通过同步的 mutation。
  strict: true,
  state: {
    count: 0
  },
  getters: {
    double (state) {
      return state.count * 2
    }
  },
  mutations: {
    add (state, payload) {
      state.count += payload
    }
  },
  actions: {
    asyncAdd ({ commit }, payload) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          commit('add', payload)
          resolve()
        }, 1000)
      })
    }
  },
  // 子模块
  modules: {
    aCount: {
      namespaced: true,
      state: {
        count: 0
      },
      mutations: {
        add (state, payload) {
          state.count += payload
        }
      },
      // modules: {
      //   cCount: {
      //     namespaced: true,
      //     state: {
      //       count: 0
      //     },
      //     mutations: {
      //       add (state, payload) {
      //         state.count += payload
      //       }
      //     }
      //   }
      // }
    },
    bCount: {
      namespaced: true,
      state: {
        count: 0
      },
      mutations: {
        add (state, payload) {
          state.count += payload
        }
      }
    }
  }
})

// 无嵌套：'aCount' 
// 嵌套：['aCount', 'cCount']
store.registerModule(['aCount', 'cCount'], {
  namespaced: true,
  state: {
    count: 100
  },
  mutations: {
    add (state, payload) {
      state.count += payload
    }
  }
})

export default store