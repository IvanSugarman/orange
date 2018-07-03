<template>
  <div class="container">
    <anchor/>
    <ul>
      <router-link tag="li" v-bind:to="'/article/' + item.href" v-for="item in list" :key="item.href">
        <span class="date">{{item.year}}.{{item.month}}.{{item.date}}</span><span class="name">{{item.title}}</span>
      </router-link>
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

  ul {
    display: inline-block;
    list-style-type: none;
    font-family: PingFang;
    font-size: 14px;
    font-weight: 800;
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
