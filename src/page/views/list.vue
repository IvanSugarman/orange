<template>
  <div class="container">
    <router-link to="/" class="title" tag="div">
      The Orange
    </router-link>
    <ul>
      <li v-for="item in list">
        <span class="date">{{item.year}}.{{item.month}}.{{item.date}}</span><span class="name">{{item.title}}</span>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default{
    data() {
      return {
        list: this.$store.getters.getRList,
      };
    },
  };
</script>

<style scoped>
  .container {
    padding: 24px;
  }

  .title {
    position: fixed;
    right: 20px;
    top: 18px;
    font-size: 14px;
    color: #6c879c;
    font-family: Pacifico, Lato, "PingFang SC", "Microsoft YaHei", Tahoma;
    cursor: pointer;
  }

  ul {
    list-style-type: none;
    font-family: PingFangSC, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: rgb(153, 153, 153);
  }

  .date {
    display: inline-block;
    text-align: left;
    width: 100px;
  }

  .name {
    color: #6c879c;
    cursor: pointer;
  }

  .name:hover {
    text-decoration: underline;
  }
</style>
