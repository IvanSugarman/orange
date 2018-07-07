#### introduction 
- whoami
- who: 输出当前访问系统用户
- who am i: 输出当前连接
- w: 这个命令输出当前用户在进行的事情
- id: 输出你的user id, primary group id和list of th groups
- su to another/root/as root: su命令允许用户以另一个用户的身份运行shell
- su -: 默认情况下su命令是维护相同的shell环境的, 如果需要切换到目标用户环境，使用su - username
- visudo: apropos visudo查看man, 可以修改/etc/sudoers


#### user management
我们主要通过useradd, usermod, userdel来创建，修改，删除用户账户。
- /etc/passwd: 其文件根据:区分，包括username, x, user id, primary group id, description, home directory, login shell
- root user: 全部权限, userid为0
- useradd: 可以通过useradd添加用户 `useradd -m -d /home/yanina -c "yanina wickmayer" yanina` -m为同时创造用户目录, -d为设置用户目录, -c为创建简介
- userdel: 通过userdel删除用户 `userdel -r yanina` -r表示同时删除用户目录
- usermod: 修改用户
- 如果没有通过-m创建用户目录, 需要通过chown, chmod命令来创建目录并指定给用户，在创建了用户目录之后, 会自动将**/etc/skel**目录中的文件拷贝到新的用户目录中。这些文件包含了一些应用的默认设置。所以，我们可以将/etc/skel用作默认主目录和默认用户配置文件设置一些东西。
- /etc/passwd中指定了用户的登录shell, 可以使用usermod命令来改变与用户使用的shell
- 用户可以通过chsh来切换登录shell, 如果切换的话，下次登录的默认设置也会改变, `chsh -s /bin/ksh`

#### user passwd
密码通常以加密的方式存储。可以通过三种方式改变用户密码, passwd, openssel passwd和重写crypt函数。
- passwd
- shadow file: 密码被加密后放置在/etc/shadow中
- passwd encryption: 一种比较容易方式加密就是通过useradd来添加密码
```bash
$ useradd -m orange
$ passwd orange
```
- openssl encryption: 另一种方式创建用户密码是创建密码的时候使用-p命令传入通过openssl加密过的密码
```bash
$ openssl passwd hunter2
# 也可以传入salt
$ openssl passwd -salt 42 hunter2 
# 通过$()直接创建用户
useradd -m -p $(openssl passwd hunter2) orange
```
- crypt encryption: 也可以通过C语言函数来自行加密
- chage: chage命令用来修改账号和密码的有效权限
     - 也可以通过编辑`/etc/login.defs `来定义参数
     - 也可以通过`/etc/default/useradd`设置参数
     - `chage -l root` 查看用户权限
     - `chage -M 60 root`
- disabling password
    当在/etc/shadow开始或者/etc/passwd第二列插入!时, 此密码不能使用。下面是锁住与解锁password的方式。
    ```bash
    # lock
    $ usermod -L orange
    # unlock
    $ usermod -U orange
    ```

#### system profile
bash和ksh都会检查`/etc/profile`并执行这个文件。root权限的用户可以通过脚本为每个用户设置alias, function, variables

- ~/.bash_profile: 当此文件存在时, bash会加载这个资源文件。在Centos7里也有使用小的文件~/.bashrc来作为小的镜像存在。
- ~/.bash_login: 当bash_profile不存在时, 检查此文件并加载
- ~/.profile: 当前两个文件不存在的时候. 检查并加载此文件
- ~/.bashrc: bashrc脚本往往都可被其他脚本引用
- ~/.bash_logout: 当退出bash的时候, 会执行此文件

#### groups
用户可以被组所归纳成群体。Group可以设置为相同的权限。高级的管理员可以使用vi或者vigr来编辑相关文件。
- groupadd: 创建用户命令
- group file: 群组管理被定义在/etc/group的文件中 分别包括username, password,gid还有用户组内的成员
- groups: groups命令可以查看属于的用户组
- 使用usermod来修改用户组`usermod -a -G tennis inge`, 一般来说usermod命令会从所有组中移除此成员, -a(append)命令用来阻止此行为。
- 使用groupmod命令来修改用户组名
- groupdel: 删除用户组
- gpasswd: 可以使用此命令将组成员的身份控制委托给另一个用户, 如`gpasswd -A serena sports`将运动组的权限委托给了serena。组管理者不必是该组成员，即使从该组删除也不会去掉他们的权限。其信息保存在/etc/gshadow文件夹中。如果想要去掉所有组管理员，可以通过gpasswd设置一个空管理列表。
- newgrp: 用来启动一个临时私有组的子shell
- vigr: 类似于vipw, vigr命令多用于修改/etc/group文件, 他更适合于锁住文件。
