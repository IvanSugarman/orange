<template>
  <div class="wrapper">
    <anchor/>
    <div class="article">
      <header>
        <h2 class="article-title">{{article.title}}</h2>
        <h4 class="article-date">{{article.year}}.{{article.month}}.{{article.date}}</h4>
      </header>
      <router-view v-highlight></router-view>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  export default{
    mounted(){
    },
    data() {
      return {
        article: this.$store.getters.getArticle(this.$route.name),
      };
    },
  };
</script>

<style scoped>
  .wrapper {
    display: flex;
    justify-content: center;
  }

  header {
    text-align: center;
    margin-bottom: 10px;
  }

  .article-date {
    color: #d9534f;
    line-height: 1.5;
  }

  .article-title {
    line-height: 1.8;
  }

  .article {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 20px;
    width: 50%;
  }

</style>
