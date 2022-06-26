<template>
  父模块的 count : {{ count }} {{ $store.state.count }}
  <button @click="$store.state.count++">错误修改</button>

  <hr />
  父模块的 double : {{ double }} {{ $store.getters.double }}

  <button @click="add">同步修改</button>
  <button @click="asyncAdd">异步修改</button>

  <hr />

  子模块的 count : {{aCount}} {{bCount}} {{cCount}}

  还没有实现命名空间之前，add 导致同时加一。
  
</template>
<script>
import { computed } from 'vue'
import { useStore } from '@/vuex'

export default {
  name: 'App',
  setup() {
    const store = useStore();
    function add() {
      store.commit('add', 1)
    }
    function asyncAdd() {
      store.dispatch('asyncAdd', 1).then(() => {
        alert('asyncAdd')
      })
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.getters.double),
      aCount: computed(() => store.state.aCount.count),
      bCount: computed(() => store.state.bCount.count),
      cCount: computed(() => store.state.aCount.cCount.count),
      add,
      asyncAdd
    }
  }

}
</script>


