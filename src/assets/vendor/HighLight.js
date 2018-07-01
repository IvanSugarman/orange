/**
 * Created by jiangmq on 2018/7/1.
 */
import Hljs from 'highlight.js'
import 'highlight.js/styles/tomorrow-night.css'
let Highlight = {}
Highlight.install = function (Vue, options) {
  Vue.directive('highlight', function (el) {
    let blocks = el.querySelectorAll('pre code');
    blocks.forEach((block) => {
      Hljs.highlightBlock(block)
    })
  })
}
export default Highlight
