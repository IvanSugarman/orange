<template>
  <div class="container">
    <anchor/>
    <ul>
      <li v-for="item in list" :key="item.href">
        <span class="date">{{item.year}}.{{item.month}}.{{item.date}}</span><router-link tag="span" v-bind:to="'/article/' + item.href" class="name">{{item.title}}</router-link>
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

  ul {
    display: inline-block;
    list-style-type: none;
    font: bold 14px "PingFang SC",Arial;
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
