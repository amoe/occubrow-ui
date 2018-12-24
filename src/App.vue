<template>
  <div id="app">
    <main-view/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import MainView from '@/views/MainView.vue';

export default Vue.extend({
  components: {MainView}
});
</script>


<style lang="less">

</style>
