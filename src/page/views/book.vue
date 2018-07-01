<template>
  <div class="wrapper">
    <anchor/>
    <ul>
      <li :class="{'end': book.isRead}" v-for="book in readList">{{book.title}}</li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
  export default{
    data() {
      return {
        readList: this.$store.getters.getBook,
      };
    },
  };
</script>

<style scoped>
  .wrapper {
    padding: 20px;
  }

  ul {
    list-style-type: none;
    font-family: PingFangSC, sans-serif;
    font-size: 14px;
    font-weight: 500;
  }

  li {
    line-height: 2;
  }

  .end {
    text-decoration: line-through;
  }
</style>
