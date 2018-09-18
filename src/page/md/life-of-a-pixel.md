## web content
- Hyper-Text Markup Language `<p>(Markup) hello(Text) </p>`
- Cascading Style Sheets `p (selector) { color(property) : red }`
- JavaScript 
- images, video, WebAssembly...

#### content
 一个网站的构成是数以千行的`html`,`css`,`javascript`通过网络以纯文本形式提供。没有编译或者打包的概念，网页的源代码就是渲染器的输入。从架构上来说，Chromium C++代码库中的`content`命名空间负责的是除了标签条、地址栏、导航按钮、菜单等的一个沙盒的内容。沙盒是Chrome安全模型的关键：渲染过程发生在沙盒之中。

#### pixel
在管道的另一端，使用底层操作系统提供的图形库将像素放置于屏幕上，在大多数平台上，这是一个名为`openGL`的标准化API，在windows上会有一个额外的DirectX来帮助转换。这些库提供了低级图形单元，像纹理、着色器之类的东西，这可以执行将坐标处的多边形绘制到虚拟像素缓冲区的操作。但他们与html或者css完全不相关。

#### goals
所以渲染的执行流程应该是，通过正确的`OpenGL`函数调用来将`html`,`css`,`javascript`转换成正确的像素来显示。其次，也需要一个正确的中间数据结构来在生成页面之后有效的更新渲染，并从script或者其他部分来回答其有关的查询。

我们将管道分为多个生命周期并生成中间输出，产生一条工作流水线。我们最终的目标是在生命周期中从`content`转化成`pixels`

## LifeCycle
#### parsing 
```xml
<!--- html code -->
<div>
    <p> hello </p>
    <p> world </p>
</div>

<!--- after parse -->
- document (root)
  - html
    - body
      - div
        - p
          - text
        - p
          - text
```
HTML标记在文档上加上了有语义话的层次结构，html片段代码经过`HTMLDocumentParser`解析之后生成`Document Object Model`结构的节点，构建成反映此结构的对象模型，通常称之为`Dom Tree`。

##### DOM
- chrome内部节点表示
- 暴露给JavaScript的API

> V8通过内部系统暴露`DOM Web APIs`像一层给真正DOM树包装的机制称为绑定。

##### style
在建立了`Dom Tree`之后，其步骤是添加`css`的样式，css选择器应该应用在DOM元素的子集上。许多元素都可能被不止一个元素选择器选择，会有冲突的样式声明在一起。

css parse:
1. css code
2. 通过`cssParser`解析为`StyleSheetContents<StyleRule>`
3. `StyleRule`生成`CSSSelectorList<CSSSelector>`
4. `StyleRule`生成`CSSPropertyValueSet<CSSPropertyValue>` 
5. `CSSPropertyValue`根据property与value分别解析。
6. 样式规则以各种方式编制索引以进行有效查找

> 属性类是由Python脚本在构建时自动生成的。 

样式解析从文档的活动样式表中获取所有已经解析的样式规则，包括浏览器提供的一组默认样式，并计算每个DOM元素的每个样式属性的最终值。这些存储在名为ComputedStyle的对象中，该对象是值的样式属性的映射。

1. Document::UpdateStyle
2. StyleResolver::StyleForElement(StyleSheetContents + UpdateStyle)
3. ComputedStyle
```
ComputedStyle {
    fontWeight = ...
    marginLeft = ...
    outline = ...
}
```

> js中可以通过getComputedStyle(element)获取元素样式属性最终值。

#### layout
构建了DOM以及计算属性样式最终值之后。下一步需要决定每个元素的位置。所以对于每个块级元素，我们需要计算矩形的坐标，这些矩形对应于元素占据的内容区域的几何区域。

> div -> LayoutObject<LayoutRect>

- 在最简单的情况下，布局以DOM顺序一个接一个的放置块，垂直下降。称之为块流，为了知道块的高度，我们必须使用计算样式中的字体来测量文本以确定行断开的位置。

- 布局也可能以一个单例的布局对象计算多种边界约。举例来说，当`overflow`属性存在时，布局的计算会同时兼顾到`border box rect`和`layout flow rect`两种，如果节点`overflow`是`scroll`属性的情况下，布局还会计算滚动边界并未滚动条保留空间。

- 而表格元素需要样式更加复杂的布局，这些表格元素将内容分为多条列的内容，或者是放置在一侧且内容在周围流动的浮动对象，或者是具有垂直而不是水平运行文本的东亚语言。

> 需要注意到的是，`DOM structure`和`ComputedStyle`值会在此时输入计算布局的算法中，管道中的每一个阶段都会使用前一个阶段的值。布局信息存储在一个树形结构里，与DOM相链接。这个树的节点实现了其布局算法，`LayoutObject`存在多种不同的自种，具体取决于其行为。
```javascript
  dom tree           layout tree
Document     --->  LayoutView
  HTML       --->    LayoutBlockFlow
    BODY     --->      LayoutBlockFlow
      DIV    --->        LayoutBlockFlow
        p    --->          LayoutBlockFlow
         Text--->            LayoutText
```

- 大多数情况下DOM与layout一一对应。但也存在LayoutObject无节点(e.g. ::after)或者节点无LayoutObject(e.g. display:none)的情况。甚至存在一个节点有多个LayoutObject
- 首先会构造一个布局树，之后通过这个布局树来决定元素几何学位置。时至今日，layout objects包含了layout阶段的输入以及输出而**并没有很好的区分**。例如，LayoutObject就会获得其元素的ComputedStyle对象的所有权。
> 新的框架LayoutNG正想办法简化Layout的计算
