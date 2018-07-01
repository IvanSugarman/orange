<template>
    <div>
      <div class="title">
        The Orange
      </div>
      <router-view v-highlight></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    export default{
        data() {
            return {};
        },
    };
</script>

<style scoped>
  .title {
    position: fixed;
    right: 20px;
    top: 18px;
    color: #6c879c;
    font-size: 14px;
    font-family: Pacifico, Lato, "PingFang SC", "Microsoft YaHei", Tahoma;
  }
</style>
