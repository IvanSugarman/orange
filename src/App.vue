<template>
  <div id="app">
    <div>
      <router-view/>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>

<style>
  @import "assets/font/font.css";

  * {
    padding: 0;
    margin: 0;
  }

  article {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    color: #333333;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.6;
    word-wrap: break-word;
  }

  article li {
    margin: 5px 0;
  }

  article p {
     margin: 5px 0;
     word-break: break-all;
  }

  article h1,
  article h2,
  article h3,
  article h4,
  article h5,
  article h6 {
    margin-top: 15px;
    text-align: left;
    margin-bottom: 15px;
  }

  article h1 {
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eee;
  }

  article h2 {
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eee;
  }

  article h1 {
    font-size: 30px;
  }

  article h2 {
    font-size: 21px;
  }

  article h3 {
    font-size: 16px;
  }

  article h4 {
    font-size: 14px;
  }

  article h5 {
    font-size: 12px;
  }

  article h6 {
    font-size: 11px;
  }

  article blockquote {
    margin: 0;
    padding: 0 1em;
    color: #6a737d;
    border-left: .25em solid #dfe2ef;
  }

  article ul,
  article ol {
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
  }

  article ol ol,
  article ul ol {
    list-style-type: lower-roman;
  }

  article ul ul ol,
  article ul ol ol,
  article ol ul ol,
  article ol ol ol {
    list-style-type: lower-alpha;
  }

  article code,
  article kbd,
  article pre,
  article samp {
    font-family: monospace, monospace;
    font-size: 14px;
  }

  article code {
    padding: .2em .4em;
    background-color: rgba(27, 31, 35, 0.05);
  }

  article table {
    display: block;
    width: 100%;
    overflow: auto;
    word-break: normal;
    word-break: keep-all;
  }

  article table th {
    font-weight: bold;
  }

  article table th,
  article table td {
    padding: 6px 13px;
    border: 1px solid #ddd;
  }

  article table tr {
    background-color: #fff;
    border-top: 1px solid #ccc;
  }

  article table tr:nth-child(2n) {
    background-color: #f8f8f8;
  }

  article table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  article td,
  article th {
    padding: 0;
  }

  article td:not(.linenos) .linenodiv {
    padding: 0 !important;
  }


  article ul,
  article ol {
    padding-left: 2em;
  }

  article ul ul,
  article ul ol,
  article ol ol,
  article ol ul {
    margin-top: 0;
    margin-bottom: 0;
  }

</style>
