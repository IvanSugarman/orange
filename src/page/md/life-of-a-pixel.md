## Start 
- Hyper-Text Markup Language `<p>(Markup) hello(Text) </p>`
- Cascading Style Sheets `p (selector) { color(property) : red }`
- JavaScript 
- images, video, WebAssembly...

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

#### DOM
- chrome内部节点表示
- 暴露给JavaScript的API

> V8通过内部系统暴露`DOM Web APIs`像一层给真正DOM树包装的机制称为绑定。

#### style
在建立了`Dom Tree`之后，其步骤是添加`css`的样式，css选择器应该应用在DOM元素的子集上。许多元素都可能被不止一个元素选择器选择，会有冲突的样式声明在一起。

css parse:
1. css code
2. 通过`cssParser`解析为`StyleSheetContents<StyleRule>`
3. `StyleRule`生成`CSSSelectorList<CSSSelector>`
4. `StyleRule`生成`CSSPropertyValueSet<CSSPropertyValue>` 
5. `CSSPropertyValue`根据property与value分别解析。
6. 样式规则以各种方式编制索引以进行有效查找

> CSS属性名是由C++进行生成的，该C++文件在构建时由Python脚本在自动生成的。

样式解析从文档的活动样式表中获取所有已经解析的样式规则，包括浏览器提供的一组默认样式，并计算每个DOM元素的每个样式属性的最终值。这些存储在名为ComputedStyle的对象中，该对象是值的样式属性的映射,这一部分称为“重计算”。这个属性值可以通过chrome的API或者JavaScript DOM API来得到。

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

#### layout
构建了DOM以及计算属性之后。下一步需要确定每个元素的位置。所以对于每个块级元素，我们需要计算矩形的坐标，这些矩形对应于元素占据的内容区域的几何区域。而多种多样的布局结构导致需要一个更加完善的数据结构来存储这一状态，使每次迭代变得高效而纯粹。

> div -> LayoutObject<LayoutRect>

- 在最简单的情况下，布局以DOM顺序一个接一个的放置块，垂直下降。称之为块流，为了知道块的高度，我们必须使用计算样式中的字体来测量文本以确定行断开的位置。

- 布局也可能存在内容超出边界而提供可滚动特性。举例来说，当`overflow`属性存在时，这些页面需要实时计算显示区域。

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

得到新的数据结构，即是对之前重计算得到的Render Tree进一步封装，将之前的复杂情况进一步考虑来确认每个元素在视图上的最终位置，即Layout Tree。
- 大多数情况下DOM与layout一一对应。但也存在LayoutObject无节点(e.g. ::after)或者节点无LayoutObject(e.g. display:none)的情况。甚至存在一个节点有多个LayoutObject
- 基于Layout Tree可以处理一系列复杂情况，但是这种结构没有将输入的计算属性和输出的视图位置分离开，所以新项目LayoutNG是为了解决这个问题。 

#### paint
再得到layout对象后可以进行绘制像素的工作了。会再一次将Layout对象转换成一个个矩形与对应的颜色。然后按堆栈的顺序来显示。每一次渲染都是根据某一种属性(e.g backgrounds、floats、foregrounds、outline)。在Paint阶段会记录一系列的绘制指令存放在一个list<DisplayItem>中。

```
DIV -> LayoutBlockFlow -> LayoutObject::Paint -> PaintCanvas::DrawRect -> List<DI> 

DisplayItem
    type = kBoxDecorationBackground
    DrawRectOp
        - rect {x,y,w,h}
        - PaintFlags
```

#### raster
在得到了元素最终在视图的显示信息之后，就要开始真正的进行预渲染。在这一步，会将屏幕上每一个像素点的颜色生成为一个32位的二进制码来分别表示4种颜色。光栅化位图存储在内存中，通常由OpenGL纹理对象来引用GPU内存，所以GPU还还可以运行产生位图的命令(加速光栅化)。光栅化通过名为Skia的库调用OpenGL调用。
> Skia是google的开源库，位于单独的代码库中，同时也被像Android等其他产品库使用。Skia在硬件周围提供了一个抽象层，并且可以理解路径和Bezier曲线等复杂东西。Skia的GPU加速代码路径构建自己的绘图操作缓冲区，在光栅任务结束实刷新。

#### gpu
真正通过skia调用的openGL API会通过`CommandBuffer`调用GPU进程来进行真正的渲染。在windows上，会先将openGL通过Angle这个库转化为DirectX。google在未来会尝试Vulkan来统一这部分的开发。

#### summary
到此时我们假定初次渲染已经完成。但是对于前端的发展来说，大量的逻辑已经从后端转为前端，DOM的更新变得异常频繁。我们需要在原有DOM上做适量的改动重新渲染，为了不将之前的流程全部在此进行，需要将其中某些状态保留来提高更新效率。

## Update LifeCycle
在更新渲染时，有时会缩放页面，区域滚动或者是动画等操作。这类型的情况下，如果渲染速率低于60帧，在人眼看到会有所卡顿。实际情况中，有一些需要解决的问题

- 在一个大区域改变时，需要对整个大区域进行全部重新渲染，比如区域滚动的情况。
- JavaScript设计是单线程的，在渲染时假如存在js脚本执行，会阻塞渲染

#### compositing
- 将页面分为独立的层，每一层渲染都是独立的
- 单独使用一个线程来渲染层(impl)

在进行动画、滚动、缩放等操作的时候，浏览器监听用户的输入行为，在impl线程先进行工作，使主线程来执行JavaScript，互不干扰，但是如果impl线程发现这个事件无法处理，还是会交还给主线程。在实现层这个概念时同样参照了树形结构，称为Layer Tree。他是命名在cc下，主要数据信息由之前的Layout Tree继承而来。中间经过一个PaintLayer Tree，是将一个LayoutObject进行分层，并且赋予其功能。
> 某些样式属性会导致为布局对象创建图层。如果布局对象没有图层，那将会绘制到最近的祖先图层中。

自然，会在layout和paint两个阶段加入composition update去加快大区域的重新渲染，来获得layout tree。google团队正在进行一个`slimming paint`的工程，将layer tree的建立放在paint阶段之后。目的是为了让每一层的layer建立变得更加独立，而且建立属性树来提取出独立或者公共的属性，尽可能的将其放到真正像素级渲染之前。impl线程的paint阶段结束后，就可以通知主线程进行同步。

#### tiling
- 在光栅化之前也有一步优化，对于大面积的滚动视图，没有必要一开始将所有内容全部变换成bimaps，我们只需要将视窗中的先进行转换，通过`tiling manager`来将区域分块，随着滚动区域的变化，将相邻区域的瓦块优先渲染。
- 一旦所有的瓷砖都被光栅化，compositor线程就会生成绘制四边形。在屏幕特定区域来绘制土块，每个四边形在内存中都引用了tile的光栅化输出。会被包裹在一个compositor框架对象来提交给浏览器进程。
- 在compositor线程上有两个树的副本，因此他可以在绘制之前一次提交时继续进行光栅化新的tile切片。

#### display
浏览器进程在名为'viz'的服务运行一个名为display compositor的组件。display compositor汇聚从所有渲染器进程提交的合成器帧，一起来自webcontents外部的浏览器UI的帧。之后发出GL代用来绘制四边形资源，这些资源进入GPU进程。最后像素显示在屏幕上。

## Review

1. 主进程
DOM -> style -> layout -> compositing update -> paint

2. impl进程
commit -> tiling -> raster(skia) -> activate -> draw

3. GPU process

4. display
