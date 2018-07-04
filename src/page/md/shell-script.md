## introduction 

#### create
创建文件 -> 可执行权限 -> 执行
```bash
echo echo Hello World > hello_world
chomod +x hello_world
./hello_world
```

#### she-bang
将#!/bin/bash放在脚本首行, 被称为she-bang，因为无法确认在bash中完美运行的脚本，可能在ksh,csh或者dash中就无法运行，为了让shell脚本运行在一个确定的环境中。++类unix操作系统会分析shebang后的内容，将这些内容作为解释器指令，并调用该指令，将载有shebang的文件路径作为该解释器的参数。++

另外即使你在脚本的开头写下#!/bin/bash，++但是在执行的过程中使用了sh命令，即sh xxx.sh来执行脚本，那么最终还是使用sh解释器来解释脚本++。

有些用户可能会执行基于setuid的脚本根欺骗，提高脚本安全性可以通过在`#!/bin/bash`后添加--禁用进一步的选项处理，这样shell不会接受任何选项。

#### basic
```
#!/bin/bash
# comment
# simple variable
var1 = 4
echo var1 = $var1
```
- 可以通过source的方式在强制脚本在同一个shell执行
```bash
source ./vars
echo $var1
```
简略方法source脚本 `. ./vars`

- 也可以通过给bash传参的方式执行脚本
```bash
bash ./vars
```

## scripting loops 

#### test
1. 可以使用test的方式测试true/false `test 10 -gt 55 && echo true || echo false`
2. 也可以使用中括号 `[6 -gt 55] && echo true || echo false`

```bash
# foo目录是否存在
[-d foo] 
# bar文件是否存在
[-e bar]
# string /etc 是否等于$pwd
['/etc' = $PWD]
# 第一个参数是否不等于`secret`
[$1 != 'secret']
# 55是否小于$bar
[55 -lt $bar]
# 大于等于
[$foo -ge 1000]
# sort before
["abc" < $bar]
# is a regular file?
[-f foo]
# is a readable file
[-r bar]
# newer than
[foo -nt bar]
# is shell option nounset set
[-o nounset]
```

man bash: 1200

#### if then else 
如果条件确认 then后的部分执行，不确认else部分执行，使用fi结束
```bash
#!/bin/bash

if [ -f isit.txt ]
then echo isit.txt exists!
else echo isit.txt not found!
fi
```

也可以通过elif在if中创建else
```bash
#!/bin/bash
count=42
if [ $count -eq 42 ]
then
  echo "42 is correct."
elif [ $count -gt 42 ]
then
  echo "Too much."
else
  echo "Not enough."
fi
```

#### for loop
example for loop in bash(同时可以用来遍历目录，文件等):
```bash
for i in 1 2 4
do 
    echo $i
done
```

example for loop with an embedded shell:
```bash
#!/bin/bash
for counter in {1..20}
do
   echo counting from 1 to 20, now at $counter
   sleep 1
done
```

#### while loop
```bash
#!/bin/bash
i=100
while [$i -ge 0]:
do
    echo hello
    sleep 1
done
```

#### until loop
```bash
#!/bin/bash
until [$i -le 0]
do 
    echo 1 $i
    let i--;
done
```

## script parameters
- 可以显示一系列参数，具体参照man bash
```bash
#!/bin/bash
echo The first argument is $1
echo The second argument is $2
echo The third argument is $3
echo \$0 $0 contains name of the script

echo \$ $$  PID of the script
echo \# $#  count arguments
echo \? $?  last return code
echo \* $*  all the arguments
```

- shift 关键字可以传递参数 $2 -> $1 $3 -> $2
```bash
#!/bin/bash                                
                                          
if [ "$#" == "0" ] 
 then
  echo You have to give at least one parameter.
  exit 1
fi

while (( $# ))
 do
  echo You gave me $1
  shift
 done
```

- read command input
```bash
#!/bin/bash
echo -n Enter a number:
read number
``` 

- get **script options** with getopts

getopts函数允许从command中取出option参数
```bash
#!/bin/ksh

while getopts ":afz" option;
do
 case $option in
  a)
   echo received -a
   ;;
  f)
   echo received -f
   ;;
  z)
   echo received -z
   ;;
  *)
   echo "invalid option -$OPTARG" 
   ;;
 esac
done
```

## more scripting
#### eval
eval允许输入变量的值作为变量,当变量中包含任何需要shell直接在命令行中看到的字符而非替换结果，就可以使用eval
```bash
answer=42
word=answer
eval "y=\$$word"; echo $y
# 42
```

#### (())
允许数值表达式的评估
```bash
((42 == $var42)) && echo true || echo false
```
- let:  让shell执行算数操作, 其返回值为0。相比于直接定义变量，可以通过let执行算数计算之后再赋值
```
let x--; echo $x;
```

#### let
let指令是用于计算的工具, 与直接声明变量不同的是,let指令可以存储数学计算之后的变量
```bash
    let x="3+4" ; echo $x
    let x="0xFF"; echo $x
``` 

#### case
case用于简化嵌套的if语句
```bash
    echo -n 'What animal you see?'
    read animal
    case $animal in
        "lion" | "tiger")
            echo "Run"
        ;;
        "cat")
            echo "Mouse"
        ;;
        *)
            echo "default"
        ;;
    esac
```

#### shell function
```bash
    # default
    function greetings {
        echo Hello World!    
    }    
    
    echo Hi
    greetings
    
    # params
    function plus {
        let result = "$1 + $2"
        echo $1 + $2 = $result
    }
    plus 1 3
```
