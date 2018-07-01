<template>
    <div>
      <ul>
        <li v-for="item in list">
          <span class="date">{{item.date}}</span><span>{{item.title}}</span>
        </li>
      </ul>
    </div>
</template>

<script type="text/ecmascript-6">
    export default{
        data() {
            return {
                list: this.$store.getters.getList,
            };
        },
    };
</script>

<style scoped>

</style>
