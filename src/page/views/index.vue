<template>
    <div class="wrapper">
      <div class="title">
        The Orange
      </div>
      <div class="bar">
        <ul>
          <router-link tag="li" to="list">
            notes
          </router-link>
          <li>
            tools
          </li>
          <router-link tag="li" to="book">
            books
          </router-link>
          <li>
            essays
          </li>
        </ul>
      </div>
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
  ul {
    list-style-type: none;
  }

  li {
    display: inline-block;
  }

  .wrapper {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: Pacifico;
  }

  .title {
    font-size: 16px;
    color: #6c879c;
  }

  .bar {
    margin: 10px 0 0 0;
    font-size: 14px;
  }

  .bar > ul > li {
    cursor: pointer;
  }

  .bar > ul > li:hover {
    color: rgba(0, 0, 0, 0.6);
    text-decoration: underline;
  }

  li + li {
    margin-left: 25px;
  }
</style>
