## pipes and command 
#### I/O Redirection
- stdin, stdout, stderr
- \>符号实际上是1>的缩写，stdout可以看为流1, 同时\>符号也会在参数0之前清除目标文件，所以指令失败时文件也会被清除
- set -o / +o noclobber：阻止覆盖写入文件
- \>| ： 强制覆盖
- \>\>: append
- 2> : stderr
- 2>&1 : 把stdout与stderr输出到一个文件(也可以使用1>&2汇入stdout)
- 一般无法对stderr使用grep, 因为管道中通常只有stdin, 通过2>&1将stderr汇入stdout中。
- &> 将stdout和stderr合并输出
- \< : 将stdin重定向(0<的简写)
- \<\<: here document 是一种持续添加输入的方式，只有遇到确定终止符(EOF)才会停止,EOF一般是Ctrl+D

    > cat <<EOF > text.txt
- \<\<\<: here string 传输字符串
- 快速清空文件 >foo / >|bar

#### filters 
commands that are created to be **used with pipe** are often calls **filters**.
- cat: 在两个管道中, 输出**stdin到stdout**
- tee: 在管道中途输出结果 
- grep: 通过一个确定的字符串过滤结果。(-i(insensitive)/-v(not match)/-A(after)/B(before)/C(context)number)
- cut: 根据分隔符来过滤文件。 
- tr: **translate** (e to E)
    - -s (squeeze)
    - -d (delete)
    - 加密文本`cat zeros.txt | tr [:lower:] 'nopqrstuvwxyzabcdefghijklm' | tr [:upper:] 'NOPQRSTUVWXYZABCDEFGHIJKLM'`
- wc: counting **words, line and characters**
- sort
- uniq
- comm: 比较文件差别 
- od: show file in the hexadecimal bytes
- sed(stream editor sed): 使用正则来编辑文件并输出

#### basic Unix tools 
- find: 查找文件
    - `find /etc > etcfiles.txt`
    - `find . -name '*.conf'`
- locate: 需要手动维护`updatedb`
- date
- cal
- sleep
- time: 计算指令时间
- gzip / gunzip / zcat / zmore

#### regular expression
存在三种正则模式 BRE(basic) ERE(Extended) PRCE(Perl) 可以通过-E -G -P来进行切换
- grep 
    - 使用或的情况可以使用-E或者-P `grep -E 'i|a' list`
    - *表示0到无穷，+表示1到无穷 `grep -E 'o+' list2`
    - $表示匹配尾部`grep r$ list2`
    - ^表示匹配首部
- sed
- history

## shell expansion
#### commands and arguments
- Bash: shell used on most Linux System
    - sh(origin Bourne shell)
    - csh(the C shell)
    - ksh(the Korn shell)
- arguments
    - command line scan
    - cutting line up in arguments & make many changes to the arguments
    - this process called shell expansion
- white space removal
    - **echo** display each argument receives from the shell and also add a new white space between arguments
    - **quotes** the content of quoted string are considered as one argument
    - 特殊符号需要转义使用echo -e(echo -e 'A line with \na new line and \ta tab')
- type: external or buildtin commands
- which: search binaries in the $PATH environment
- alias
- unalias
- set +x / set -x: display shell expansion

#### control operators
- ; : two or more commands on the same line separated
- & : 设置此进程为后台进程(可以通过fg打开)
- $?: 上一个命令的退出代码，是一个shell参数而非变量
- &&：logical AND
- ||：logical OR
- \# : ignored
- \ 
    - 转义字符
    - 反斜线

#### shell variables
- dollar sign
    - 环境变量
    - case sensitive
    - singlequote vs doublequote
    - var=155
    - unset
- $PS1: 用户平时的提示符
- $PS2: 第一行没有输入完，等待第二行输入的提示符
- $PATH: 执行命令目录集合
- set: 显示当前shell的变量，包括当前用户的变量
- env: 显示当前用户的变量
- export 显示当前导出成用户变量的shell变量
- set -u / set +u: 设置无变量时的报错方案

#### shell embedding and options
- shell embedding
    - $(var=5;echo $var)
    - single quote **`**

#### shell history
- !! : repeat last command
- ! + charcter: 重复上一个以单词开头的命令
- history n: display history
- ctrl + r:  search the history
- $HISTSIZE / $HISTFILE / $HISTFILESIZE
- use ++a space prefix++ to prevent record
- 可以使用!的同时使用s替换: cat file1;!c:s/1/2

#### file globbing(通配符)
- *(匹配所有)
- ?(匹配具体一个)
- []
- a-z / 0-9

