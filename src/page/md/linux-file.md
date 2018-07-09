## 标准文件权限

用户和组通常在/etc/passwd和/etc/group中进行管理，也可以通过NIS，LDAP或者samba域。如下列出所有用户
```bash
$ cut -d: -f1 /etc/passwd | column
```

#### chgrp
更改文件group拥有者权限
```
$ chgrp snooker file2
```

#### chown
更改文件用户own user权限和group拥有者权限
```
$ chown root:project42 file
```

#### 文件类型
执行`ls -l`的时候，对每一个文件都能看到在user和group之前的10个字母，第一个字母告知文件类型。
character | type
---|---
- | normal file
d | directory
l | symbolic link
p | named pipe
b | block device
c | character device
s | socket 

#### 权限
之后的9个字母是三组权限。按照顺序分别是own user权限、group权限以及其他权限
permission | on a file | on a directory
--- | --- | ---
r(read) | read file content(cat) | read directory contents(ls)
w(write) | change file contents(vi) | create files in(touch)
x(execute) | execute the file | enter the directory(cd)

只有当你不属于此文件，也不属于此组时才会适用于其他权限。

#### chmod
改变权限
```bash
# 增加用户执行权限
$ chmod u+x permissions.txt
# 去掉组可读权限
$ chmod g-r permissions.txt
# 增加其他写权限
$ chmod o+w permissions.txt
# 设置具体权限
$ chmod u=rw permissions.txt
# 通过二进制设置权限
$ chmod 777 permissions.txt
```

#### umask
权限掩码umask命令指定了创建文件或者目录等时不被默认设置得权限，通常umask值为022，此时建立的文件默认权限是644(6-0, 6-2, 6-2)，建立的目录的默认权限是755(7-0, 7-2, 7-2)。
```
# 展示默认权限
$ umask
```

## 高级文件权限
#### sticky bit on directory
可以通过设置sticky bit来阻止用户删除不属于他们的文件。sticky bit展示在其他权限的x权限处，展示为t(x同时存在)或者T(x并不存在)
```bash
$ chmod +t /project
```

#### setgid bit on directory
可以在目录上使用setgid来确保目录中的所有文件都归目录的组所有者所有。其位置被设置为group权限中x的位置。展示为s(x同时存在)或者S(x并不存在)。
如下例子中，即使root不属于组proj55, 但是setgit已经设置得情况下，/project55中root创建的文件属于proj55
```bash
groupadd proj55
chown root:proj55 /project55/
chmod 2775 /prject55/
# 在root权限下,可以发现创建的此文件属于组proj55
touch /project55/fromroot.txt  
```

#### setgid and setuid on regular files
这两个权限导致使用文件所有者而不是执行所有者的权限执行可执行文件。这意味着如果任何用户执行属于root用户的程序，并且在程序上设置了setuid位，程序以root身份运行。这可能很危险，但是有时对安全性有好处。一个例子是在用户修改自己密码时，需要操作到`/etc/shadow`，这对用户是只读的。当执行此程序的时候,实际上是以root权限来执行的,可以通过命令查看到在`/usr/bin`中, passwd命令是具有setuid权限的。可以通过find来查找所有setuid与setgid的文件和目录。在大多数情况下，在可执行文件上设置setuid已经足够了。设置setgid位将导致这些程序使用其所有者的凭据运行。

sudo命令就使用了setuid位，因此所有用户都可以使用root的有效用户标志来运行他。
```bash
# 查找设置了setgid的目录
$ find / -type d -perm -2000 2> /dev/null
# 查找设置得setuid的文件
$ find /usr/bin -type f -perm -04000
```

## file links
通常来说Linux系统中都存在一定数量的**hard links**以及**symbolic link**。为了理解，首先要理解inode的概念。

#### inodes
inode是一种包含文件元数据的数据结构。当一个新文件存储在文件系统的硬盘上，不仅仅只存文件内容，也包括一些其他的属性，这些属性就被存在inode上。当文件修改时，inode也随之修改。

#### inodes table/number
- inode table包括了在文件系统上创建的所有inodes。可以通过`df -i`指令来查看系统挂载的inode
- 对于每一个inode都有单独的number,通过`ls -li`指令可以查找
- 目录是特殊类型的文件，目录包含了一个记录着文件名映射到inode的表。通过`ls -ali`来展示目录

#### hard links
对于源文件和硬链接，他们拥有相同权限，相同拥有者，相同内容以及相同inode，文件是完全相等的。这意味着你可以安全的删除源文件而硬链接仍会保留。inode会保留一个计数器，记录对自身的hard links。当这个inode的计数器跳到0时，inode会被清空。
- 通过ln来创建文件的硬链接，一个新文件名作为额外的入口被添加到目录中。
    ```bash
    $ ln file2 hardlink_to_file2
    ```
- 可以通过find指令来通过inode寻找文件，栗子表示了如何查找inode为817270的文件。inode是唯一划分文件的标准。
    ```bash
    $ find / -inum 817270 2> /dev/null
    ```

#### symbolic links
软链接不通过inodes连接，只是创建一个名词与名词对应的映射。
- 通过`ln -s`创建, 有自己单独的inode
    ```bash
    ln -s file2 symlink_to_file2
    ```
- 对于软链接来说，只要目标的权限适用，权限是无意义的。硬链接仅限于他们自己的分区(因为指向同一个inode)，但是软链接可以连接到其他任何地方。(包括文件系统，甚至联网)

#### remove link 
通过`rm`指令可以删除链接。

## access control lists
可以通过acls进一步保护文件与目录。所有支持访问控制列表或者acls的文件系统必须使用`/etc/fstab`中列出的acl选项进行安装。

#### getfacl
获取文件的acls。

#### setfacl
可以通过`/usr/bin/setfacl`设置文件的acls
```bash
# 设置sandra用户此文件用户权限为rwx
$ setfacl -m u:sandra:7 file33
# 设置tennis的组此文件组权限为rw-
$ setfacl -m g:tennis:6 file33
```

#### remove acl entry
```bash
setfacl -x sandra file33
```

#### remove complete acl
```bash
setfacl -b file33
```
