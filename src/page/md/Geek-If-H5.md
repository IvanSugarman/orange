记录一下第一个H5项目中踩到的坑与一些思路问题

### 适配
1.  设置viewport为设备宽度

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
2.  将Viewport分成10rem，并计算1rem在当前浏览器中的像素值，赋值给root中font-size

```
    /**
     * 使用rem方式适配移动端
     * 参数resolution为设计稿屏幕分辨率
     * 应在dom ready后使用
     * */
    setPageByRem(resolution){
        // 设置meta标签 保证页面大小与设计稿一致
        const scale = 1 /  window.devicePixelRatio;
        document.querySelector('meta[name="viewport"]').setAttribute('content','initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
        // 设置根节点的font-size属性
        let deviceWidth = document.documentElement.clientWidth;
        if (deviceWidth > resolution){
            deviceWidth = resolution;
        }
        document.documentElement.style.fontSize = deviceWidth / 10 + 'px';
    }
```

3.  css适配使用rem(width,height,margin,padding...),
    browser-default-font-size为1rem在设计图中宽度
    
```
$browser-default-font-size: 124px !default;

@function px2em($px) {
  @return $px / $browser-default-font-size * 1rem;
}
```

4. 可以使用阿里手淘适配库 **lib-flexible** ,在Web页面的<head></head>中添加对应的flexible_css.js,flexible.js文件。

5. 以上方式基于宽度进行REM计算，当屏幕宽高比过低时(pad)，需要使用媒体查询或者其他方式进行布局。本次项目中将content部分通过计算进行比例上的缩小(transform:scale)。rem计算出的content部分高度要大于设置的高度百分比。固定头部底部高度。通过clientHeight - header.Height - footer.Height得到屏幕剩余高度。通过realHeight / lessHeight 比例计算缩放比例并进行配置。


### 布局
布局上主要使用flex布局,参考阮一峰个人博客中flex布局语法篇与实战篇。

1. 设置flex布局
 
采用flex布局的元素成为flex容器，其内子元素成为容器成员。容器存在**水平主轴(main axis)**与**垂直交叉轴(cross axis)**。

```
display: flex;
display: -webkit-flex
```

2. 容器属性

```
flex-direction: row（水平） | column （垂直） | row-reverse | column-reverse //主轴方向 决定项目如何排列
flex-wrap: nowrap（不换行） | wrap | wrap-reverse;
flex-flow: flex-direction | flex-wrap

//水平对齐
justify-content: flex-start（左对齐） | flex-end（右对齐） | center（居中） | space-between（两侧对齐，间距相等） | space-around（每个项目间距相等，边上的项目与侧面间距是项目之间间距的1/2）
//垂直对齐
align-items：flex-start | flex-end | center | baseline（项目的第一行文字的基线对齐） | stretch（所有项目将拉伸到占满整个容器）;
//多根轴线（多行）下的对齐方式
align-content: flex-start | flex-end | center | space-between | space-around | stretch;
```

3. 项目属性

```
//定义项目的排列顺序 数值小排列靠前
order : <integer>
//放大比例
flex-grow: <number>;
//缩小比例
flex-shrink: <number>; /* default 1 如果空间不足 项目缩小*/ 
//主轴多余空间
flex-basis: <length> | auto; /* default auto */
flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
//单个项目排列方式，可覆盖align-items
align-self: auto | flex-start | flex-end | center | baseline | stretch;
```
 
### Swiper
##### html

```
 <div class="swiper-wrapper">
    <div class="swiper-slide swiper-no-swiping"/>
    <div class="swiper-slide swiper-no-swiping"/>
```

##### js

```
/**
 * 初始化swiper
 */
function setSwiper() {
    //设置高度
    $(".swiper-container").height($(window).height());
    //设置swiper
    mySwiper = new Swiper('.swiper-container', {
        direction: 'horizontal',
        loop: false,
        noSwiping: true,
    });
}
```
##### swiper常用方法

```
    mySwiper.slideNext(runCallbacks, speed);
    mySwiper.slidePrev(runCallbacks, speed);
    //runCallbacks:可选，boolean，设置为false时不会触发onSlideChange回调函数。
    mySwiper.slideTo(index,speed, runCallbacks);
```

##### swiper常用事件

```
    mySwiper = new Swiper('.swiper-container', {
        onSlideChangeStart: function(swiper){
            swiper.activeIndex; //过渡后的slide索引
        },
        onSlideChangeEnd: function(swiper){
            swiper.activeIndex;//切换结束时，是第几个slide
        }
    }
```
### Canvas

##### 初始化
大多数Canvas的绘图api都通过canvas.getContext()获得一个绘图环境对象。
```
 var c = document.getElementById("load");
 var ctx = c.getContext("2d");
 w = canvas.width,
 h = canvas.height,
```

##### 绘制一个矩形

```
ctx.fillStyle='#FF0000';
ctx.fillRect(x,y,width,height);
```

##### 绘制一个圆

```
ctx.beginPath(); //起始一条路径，或重置当前路径
ctx.fillStyle;//可以设置canvas要填充的样式
ctx.arc(x,y,radius,startAngle,endAngle,flag); //以canvas内坐标点(x,y)为圆心radius为半径,起始弧度为startAngle，终止弧度为endAngle，flag为bool值，当flag值为true时，表示逆时针旋转，当flag为false，表示以顺时针旋转;
ctx.closePath();
ctx.fill();//填充当前绘图路径;
```

##### 变换
弧度以圆形的X轴正向为起点，以0表示。一个圆弧总共为2 * Math.PI。

```
ctx.rotate(angle) //旋转
context.translate(x,y) //平移
```

##### 绘制图形

```
var img = new Image();
img.src = "./img/load/load1.png";
//在图片加载完成之后才往canvas画布上绘制
img.onload = function(){
   //画布的清空方法
   ctx.clearRect(0, 0, c.width, c.height);
   //绘制图形 dest为图像剪切
   ctx.drawImage(img, x, y, width,height,destX,destY,destWidth, destHeight);
}
```
### H5音频视频
##### 音频
    <audio src="./video/music.mp3" loop="loop" id="loopMusic" preload></audio>
    
在IOS中音频文件不允许自动播放。可以通过微信的WeixinJSBridgeReady事件。这个是微信自带提供的事件。

音频的播放环境大致分为

1. 支持audio的autoplay，大部分安卓机子的自带浏览器和微信，大部分的IOS微信（无需特殊解决）

2. 不支持audio的autoplay，部分的IOS微信（上文提供的解决方案）


3. 不支持audio的autoplay，部分的安卓机子的自带浏览器（比如小米，开始模仿safari）和全部的ios safari（这种只能做用户触屏时就触发播放了）
 

综合解决办法（需要引入weixin的jssdk）

```
function audioAutoPlay(id){  
    var audio = document.getElementById(id),  
        play = function(){  
            audio.play();  
            document.removeEventListener("touchstart",play, false);  
        };  
    audio.play();  
    document.addEventListener("WeixinJSBridgeReady", function () {  
        play();  
    }, false);  
    document.addEventListener('YixinJSBridgeReady', function() {  
        play();  
    }, false);  
    document.addEventListener("touchstart",play, false);  
}  
```

##### 视频
在IOS中视频自动会通过IOS自带的播放器进行播放，这样无法做到自动播放，在浏览上也有问题。通过playsinline属性进行解决。
    
    <video id="mainvideo01" src="./video/v01.mov" width="100%" x5-playsinline=""
                       webkit-playsinline="" preload="auto" playsinline webkit-playsinline></video>
            
为了将视频设置为全屏播放，将其容器高宽设置为100%, 同时设置视频宽度稍大于容器

```
.container {
    width: 100%;
    height: 100%;
    display: flex;
    display: -webkit-flex;
    align-content: center;
    position: absolute;
    left: 0;
    top: -10%;
    overflow: hidden;
    video {
      min-height: 120%;
    }
  }
```

### 微信分享代码
此部分代码用于项目中复用。

```
    //分享
    var shareImgUrl = "img-url";
    var shareLinkUrl = "share-url";
    var url = encodeURIComponent(window.location.href);
    //配置
    $.ajax({
        type: "post",
        dataType: "jsonp",
        url: "jssdk-url",
        data: {
            url: url
        },
        jsonp: 'jsoncallback',
        success: function (result) {
            callback(result);
        }
    });

    function callback(config) {
        wx.config(config);
        wx.ready(function () {
            wx.onMenuShareAppMessage({
                title: 'title',
                desc: 'description',
                link: shareLinkUrl,
                imgUrl: shareImgUrl
            });
            wx.onMenuShareTimeline({
                title: 'title',
                link: shareLinkUrl,
                imgUrl: shareImgUrl
            });
        });
    }
```
