<template>
  父模块的 count : {{ count }} {{ $store.state.count }}
  <button @click="$store.state.count++">错误修改</button>

  <hr />
  父模块的 double : {{ double }} {{ $store.getters.double }}

  <button @click="add">同步修改</button>
  <button @click="asyncAdd">异步修改</button>

  <hr />

  子模块的 count : {{aCount}} {{bCount}} {{cCount}}

  <button @click="$store.commit('aCount/add', 1)">改a</button>
  <button @click="$store.commit('bCount/add', 1)">改b</button>
  <button @click="$store.commit('aCount/cCount/add', 1)">改c</button>
  
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


