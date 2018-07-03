1. 
- HTML + JS -> HTMLParse + V8 -> DomTree 
- CSS -> CSS Parser -> CSS Rules
- CSS Rules attach Dom Tree -> Render Object

    DOM节点通过连接CSS可以生成++Render Tree++

2.  RenderTree中的RenderObject可能因为某些概念与DOM树区分而形成render layer, 构成++Layer Tree++(BFC&IFC, 伪元素, display:none与html的list tag)
3.  根据Render Layer与Render Object生成LayoutTree，根据CSS样式确定大小和位置
4.  PaintLayer根据特定HTML标签或者CSS样式创建，主要用来确定页面元素绘制顺序。可以包含多个Render Object。在多个层上完成绘制的过程。是Graphics Layer创建的最小单位。
5.  为了优化动画、Video、canvas、3d的css等东西。页面有这些元素时，页面显示会经常变动，浏览器为了优化而引入Graphics Layer。主要通过GPU硬件加速来优化性能，也会带来一定单位内存消耗。它不知依赖于特定的HTML tag和css样式，还依赖于位置，比如重叠，父子关系等等。(从render object/render layer变换来得paint layer和graphics layer主要均用来渲染层的合并，也可以统一称为composite tree)。之后通过渲染层生成绘制命令
6.  Tile切片，可以局部更新，优化渲染性能
7.  根据需要绘制的Tiles，构建渲染资源依赖关系图，并进行++光栅化++
8.  光栅化生成的数据++通过GL显示到屏幕++