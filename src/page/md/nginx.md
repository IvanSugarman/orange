#### 概述

- 代理

    - 正向代理
    - 反向代理
    
- 负载均衡
    
    - 内置策略
        1. 轮询
        2. 加权轮询
        3. IP hash
    - 扩展策略
        1. url hash
        2. fair

- 模块

    - core模块:nginx服务器核心功能
    - http模块: nginx服务器http web服务
    - event模块: 事件处理服务
    - mail模块:邮件服务

#### rewrite

##### 服务器组的配置指令
由ngx_http_upstream_module进行解析处理
1. upstream
        
        upstream name {...}

    name为服务器组组名，花括号中列出服务器组包含服务器。默认情况下使用轮询。但是可以使用其他负载均衡策略。

2. server

        server address [params]
        
    - address: 服务器地址
    - weight: 权重
    - max_fails: 设置请求失败次数
    - fail_timeout: 时间范围
    - backup: 标记为备用服务器
    - down: 标记为无效状态
    
    
```
upstream backend{
    server example.com weight=5;
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s
}
```

s
3. ip_hash

    根据ip分配到同一台服务器，保证其建立稳定的连接。ip_hash在实际使用上也有限制，首先，++不能与weight变量一起使用++。其次，由于ip_hash主要根据客户端IP分配服务器，因此，++Nginx应该处于最前端的服务器++，这样才能获取到IP地址，否则++将得到的位于其前面的服务器地址++。
    
```
upstream backend{
    ip_hash;
    server myback1.com
    server myback2.com
}
```

4. keepalive

    控制网络连接保持功能，此命令保证Nginx服务器的工作进程为服务器组打开一部分网络连接，并且将数量控制在一定范围内。
5. least_conn
            
        least_conn;
    该指令用于配置Nginx服务器使用负载均衡策略为网络连接分配服务器组内的服务器，在功能上实现了最少连接负载均衡算法。考虑各服务器权重的同事，每次选择当前网络连接最少的服务器，如果有多台，采取加权轮询原则选择权重最大的服务器

##### “地址重写”与“地址转发”
- 地址重写
    为了实现地址标准化。访问google首页的时候，我们可以输入www.google.com，也可以输入google.cn。实际上google服务器在不同的地址中选择了确定的一个并进而返回服务器响应。google.cn在服务器被改变为www.google.com的过程就是地址重定向的过程。

    google.cn-->www.google.com

- 地址转发
一个域名指到另一个已有站点的过程。

区别：
1. 客户端浏览器地址显示不改变。地址重写改变为服务器选择确定的地址。
2. 一次地址转发过程只产生一次网络请求，一次地址重写一般产生两次请求
3. 地址转发一般发生在同一站点项目内。地址重写没有限制
4. 地址转发的页面可以不用全路径名表示，重写必须用
5. 地址转发可以将request范围内属性传递给新页面，地址重写不可以


##### rewrite规则
rewrite规则用于实现url的重写，nginx服务器的rewrite功能的实现依赖于PCRE(Perl兼容的正则表达式)，Nginx服务器使用ngx_http_rewrite_module解析与处理rewrite功能相关配置。

- if 
  使用=或者!=比较变量字符串是否相等。变量与正则表达式中使用~ (大小写敏感),~* (大小写不敏感), !~ , !~*。
   
```
if($http_user_agent ~ MSIE){
    #$http_user_agent值中是否含有MSIE字符串
}
```

```
if(-f $request_filename){
    #判断请求的文件是否存在
    #判断请求的目录是否存在使用-d
    #判断请求的目录或者文件是否存在使用-e
    #判断请求的文件是否可执行使用-x
}
```

- break
该指令用于中断当前相同作用域的其他nginx配置

```
location / {
    if($slow){
        set #id $1;
        break;
        limit_rate 10k;
    }
}
```
- return

```
return [ text ]; #响应体内容，支持变量使用
retrun code URL;#返回给客户端的状态代码
return URL; #返回给客户端的URL地址
```

- rewrite指令

通过正则表达式的使用来改变URI，可以同时存在一个或者多个指令。按照顺序依次对URL进行匹配和处理


```
rewrite regex replacement [flag]
```

1. regex


```
rewrite myweb http://newweb.com/permanent
```

rewrite截取到的地址不包含host地址，这表示我们使用rewrite指令重写http://myweb.com/source是办不到的,rewrite截取到的URL是/source,不包含myweb.com，也不会包含参数

2. replacement
匹配成功后替换URI中被截取内容的字符串。默认情况下，如果该字符串是由http://或者https://开头，则不会对URI进行其他处理，直接将重写的URI返回客户端

3.flag
用于设置rewrite对URI的处理行为，可以为以下几种
 - last: 中止在本location处理接收到的URI，并将此处重写的URI做为一个新的URI，使用各location块进行处理。

- break
将此处重写的URI作为一个新的URI,重写的地址在当前的location块执行，不转到其他location块

- redirect 
重写后的URI返回给客户端，状态代码为302，指明临时重定向。

- permanent
重写后的URI返回给客户端，状态代码为301，指明永久重定向。

##### rewrite的使用
- 域名跳转


```
server{
    listen 80;
    server_name jump.myweb.name;
    rewrite ^/ http://www.myweb.info/;
}
# 客户端访问http://jump.myweb.name时，URL被Nginx重写为http://jump.myweb.info，客户端得到的数据其实是由后者响应的
```

- 域名镜像

域名镜像是指将一个完全相同的网站分别放置在几个服务器上，并分别使用独立的URL，其中一个叫主站，其他叫镜像网站。镜像网站可以保存网页信息，历史性数据，以放置丢失。并且可以提高网站不同地区的相应速度，镜像网站可以平衡流量负载等等。可以通过Nginx的URL重写到指定的URL，++将不同的镜像URL重写到指定的URL就可以了。++

```
server{
    listen 80;
    server_name mirror.myweb.name;
    rewrite ^(.*) http://jump.myweb.name$1 last;
}

```

- 独立域名

 当网站包含多个板块时，可以设置独立域名。
 
```
server{
    listen 80;
    server_name bbs.myweb.name;
    rewrite ^(.*) http://www.myweb.name/bbs$1 last;
    break;
}

server{
    listen 81;
    server_name home.myweb.name;
    rewrite ^(.*) http://www.myweb.name/home$1 last;
    break;
}
```

- 目录自动添加"/"
- 目录合并(利于SEO)
- 防盗链


#### 代理

##### 正向代理
- **局域网**内机器借助代理服务访问局域网外网站
- 防火墙，监控，管理
- 不支持外部对内部的访问请求

1. resolver

```
resolver address ... [valide=time]
#address DNS服务器ip
#time 数据包有效时间
```

2. resolver-timeout

设置DNS服务器域名解析超时时间

3. proxy_pass


```
proxy_pass URL;
#URL 设置的代理服务器协议和地址
```

4. exp

```
server{
    resolver 8.8.8.8;
    listen 82;
    location /{
        proxy_pass http://$http_host$request_uri;
    }
}
```



##### 反向代理
- 局域网向Internet提供资源，让其他用户可以访问局域网内的资源
- 让外网客户端接入局域网内站点访问资源
- nginx中反向代理可同时接受的客户端连接计算方法为: worker_processes * wroker_connections / 4

1. proxy_pass

```
proxy_pass URL;
#url可以是主机名称，IP加端口号等形式,甚至unix-domain套接字路径

proxy_pass http://www.myweb.name/uri
proxy_pass http://localhost:8000/uri
proxy_pass http://unix:/tmp/backend.socket:/url

# 如果URL中不包含URI，Nginx服务器不会改变原地址的URI，如果包含的URI，Nginx将会使用新的URI替代原来的URI

server{
    listen 80;
    server_name www.myweb.name;
    location /server/{
        proxy_pass http://192.168.1.1;
    }
}

# 当http://www.myweb.name/server发起请求，该请求处理后转向http://192.168.1.1/server
```

当URL变量末尾加斜杠的情况下，如果匹配/

```
# proxy_pass http://192.168.1.1;
# proxy_pass http://192.168.1.1/; 
# 如果请求http://www.myweb.name/index.htm
# 均指向http://192.168.1.1/index.htm
```

如果使用/server作为uri变量来匹配

```
# 请求http://www.myweb.name/server/index.htm
# 使用配置1 转为http://192.168.1.1/server/index.htm
# 使用配置2 转为http://192.168.1.1/index.htm
```

2. proxy_pass_header

默认情况下，Nginx服务器在发送响应报文时，报文头中不包含"Date","Server","X-accel"等来自代理服务器的头域信息，该指令可以设置并发送。

3. proxy_set_header

该指令可以更改Nginx服务器收到的客户端请求的请求头信息，然后将新的请求头发送给被代理的服务器。

```
proxy_set_header filed value;
# filed更改头域 value更改值
# proxy_set_header Host $proxy_host


proxy_set_header Host $http_host; #将目前Host头域的值填充成客户端地址
proxy_set_header Host $host#将当前location块的server_name指令填充到host头域
proxy_set_header Host $host:$proxy_port#将当前location块的server_name指令值和Listener一起填充到host头域
```

#### 负载均衡
- 静态负载均衡
    
    - 轮询
    - 基于比率的加权轮询算法
    - 基于优先级的加权轮询算法
    
- 动态负载均衡

    - 基于任务量的最少连接优先算法
    - 基于性能的最快相应有限算法
    - 预测算法
    - 动态性能分配算法
    
Nginx主要通过proxy_pass指令和upsteam指令配置负载均衡。

1. exp1
    

```
# 配置后端服务器组
upstream backend   
{
    server 192.168.1.2:80;
    server 192.168.1.3:80;
    server 192.168.1.4:80;
}
server{
    listen 80;
    server_name www.myweb.name;
    index index.html index.htm;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }
}
```
该配置中所有访问www.myweb.name的请求都会在backend服务器组中实现负载均衡。并++按照一般轮询策略接受请求任务(weight默认1)++

2. exp2


```
# 配置后端服务器组
upstream backend   
{
    server 192.168.1.2:80 weight = 5;
    server 192.168.1.3:80 weight = 3;
    server 192.168.1.4:80;
}
server{
    listen 80;
    server_name www.myweb.name;
    index index.html index.htm;
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
    }
}
```
加权轮询

3. exp3
```
# 配置后端服务器组
upstream videobackend   
{
    server 192.168.1.2:80;
    server 192.168.1.3:80;
    server 192.168.1.4:80;
}
upstream filebackend   
{
    server 192.168.1.5:80;
    server 192.168.1.6:80;
    server 192.168.1.7:80;
}
server{
    listen 80;
    server_name www.myweb.name;
    index index.html index.htm;
    location /video/ {
        proxy_pass http://videobackend;
        proxy_set_header Host $host;
    }
    location /file/ {
        proxy_pass http://filebackend;
        proxy_set_header Host $host; #保留客户端的真实信息
        proxy_set_header X-Real-IP $remote_addr
    }
}
```
特定资源实现加权轮询

4. exp4 
```
# 配置后端服务器组
upstream bbsbackend   
{
    server 192.168.1.2:80;
    server 192.168.1.3:80;
    server 192.168.1.4:80;
}
upstream homebackend   
{
    server 192.168.1.5:80;
    server 192.168.1.6:80;
    server 192.168.1.7:80;
}
server{
    listen 80;
    server_name home.myweb.name;
    index index.html index.htm;
    location / {
        proxy_pass http://homebackend;
        proxy_set_header Host $host;
    }
}

server{
    listen 81;
    server_name bbs.myweb.name;
    index index.html index.htm;
    location / {
        proxy_pass http://bbsbackend;
        proxy_set_header Host $host;
    }
}
```
对不同域名实现负载均衡。设置了两个虚拟服务器和两组后端被代理的服务器组分别进行负载均衡处理

#### 正则与匹配

##### 匹配

```
location = / {
    # 精确匹配 / ,主机名后面不能带任何字符串
}

location / {
    # 因为所有的地址都以 / 开头，所以这条规则将会匹配所有请求
    # 但是正则和最长字符串会优先匹配
}

location /documents/ {
    # 匹配任何/documents/开头的地址，匹配符合以后，还要继续往下搜索
}

location ~ /documents/Abc{
    # 匹配任何以 /documents/Abc开头的地址，匹配符合以后，还要继续往下搜索
}

location ^~ /images/ {
    # 匹配任何以 /images/ 开头的地址，匹配符合以后，停止往下搜索
}

location ~* \.(gif|jpg|jpeg)$ {
    # 匹配所有以gif,jpg,jpeg结尾的请求
    # 但是所有请求/images/下的图片被上一条处理
}
```

- 以=开头表示精确匹配
- ^~开头表示uri以常规字符串开头，++不是正则匹配++，++不会往下搜索++
- ~开头表示区分大小写的正则匹配
- ~*开头表示不区分大小写的正则匹配
- /通用匹配


优先级： location= > location完整路径 > location ^~ 路径 > location ~,~*正则顺序 > location 部分起始路径 > /

##### 正则

 : 

key | value
---|---
. | 匹配除换行符以外的任何字符
? | 重复0次或1次
+ | 重复0次或更多次
\d |  匹配数字
^ | 匹配字符串的开始
$ | 匹配字符串的结束
{n} | 重复n次
{n,} | 重复n次或更多次
[c] | 匹配单个字符c
[a-z] | 匹配a-z小写字母的任意一个
() |  之间匹配的内容，后面可以通过$1,$2..等引用


    rewrite '^/images/([a-z]{2})/([a-z0-9]{5})/(.*)\.(png|jpg|gif)$' /data?file=$3.$4;
