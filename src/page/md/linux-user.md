## linux local user management

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
