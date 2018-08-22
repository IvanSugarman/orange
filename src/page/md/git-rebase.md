## 概述
通常整合来自不同分支的修改存在`git rebase`与`git merge`两种方式。

#### merge
对于merge来说,feature分支中新的合并提交(merge commit)会将两个分支历史连在一起，每次合并上游更改时**feature分支都会引入外来的合并提交**。在一个项目中，如果master非常活跃，这样或多或少会污染分支历史，同时也增加理解项目历史的难度。

#### rebase
rebase会把整个feature分支移动到master的后面，有效的把所有master分支上新的提交并入过来。但是rebase会为原分支每一个提交创建一个新的提交，重写项目历史，并且**不会带来合并提交**。rebase最大的好处是项目历史会非常整洁并呈现为线性。这更容易使用`git log`, `git bisect`和`gitk`来查看项目历史

## 工作流
工作流中应当尽量使用交互式的rebase来保证master分支的干净。

交互式的rebase允许更改并入新分支的提交。提供了对分支上提交历史完整的控制。**一般来说，用于将feature分支并入master分支之前用来清理混乱的历史。**忽略不重要的提交让feature历史更清晰易懂，你应当保证自己每一次并入master都是一次**干净且有意义**的提交。

#### 合并分支 

1. 在feature分支上存在区别master的3个commit。
```bash
Author: orange
Date:   Fri Jul 6 10:32:34 2018 +0800
    third commit
commit 2f82ed02a0c6155dd39d5f798e50d787ba558450
Author: orange 
Date:   Fri Jul 6 10:32:21 2018 +0800
    second commit
commit 872db57c88195381914370048b34487035a5205f
Author: orange
Date:   Fri Jul 6 10:31:58 2018 +0800
    first commit
```
2. 开始交互式rebase

```bash
$ git checkout feature
$ git rebase -i origin master
```
3. 这将打开一个文本编辑器，可以通过选项编辑提交
    - editor
    - modified commit
    - update commit message
4. 修改成功
```bash
commit 22c0e97c2a4e3ba63afa7a1fadc84291584bab38
Author: jiangmengqi <jiangmengqi@xiaomi.com>
Date:   Fri Jul 6 10:31:58 2018 +0800
    rebase commit
```
    在此阶段，本地分支由于`git rebase`命令修改了提交的历史记录，所以会造成远端与本地不一致的情况。此时可以选择性的通过`git push -f`覆盖远端的分支，此操作会**强制推送本地分支的历史至远端覆盖**。
    
5. 合并到master

```bash
$ git checkout master
$ git merge feature 
```

## 常用命令
#### git commit --amend
此命令合并此次提交内容至上一次的commit中。适用于只进行了简单修改的commit。

#### git commit --force-with-lease
从Git1.8.5版本开始提供，旨在解决`git push --force`命令造成的安全问题。`git push --force`会使用本地分支覆盖远端推送分支。如果他人在相同分支推送了新的提交也会被覆盖掉。就算强制推送之前fetch并且merge或者rebase也不安全，**因为操作到推送之间存在时间差。**

使用`--force-with-lease`推送时远端有人推送新的提交，此推送将被拒绝。

- fetch之后本地的origin已经看到他人提交，依然强制推送还是会覆盖
- 此参数解决的问题是**本地仓库不够新时，依然覆盖了远端新仓库的问题。如果执意想要覆盖远端提交，只需要先fetch再推送**
- 当使用此命令被拒绝时，**你需要fetch仓库**，确认他人是否有新的修改，没有则可以继续推送
- 如果存在新的提交，应该进行一次merge或者rebase，之后再进行推送或者强制推送

#### continue

在rebase的过程中，出现conflict的情况下, git会停止rebase并让你解决冲突。在解决完冲突之后，用git add命令更新内容索引，之后执行rebase continue命令。git会继续应用余下的补丁。
```bash
$ git add .
$ git rebase --continue
``` 
#### abort

在**任何时候**，可以使用--abort参数终止rebase行动, 并且feature分支会**回到rebase开始前的状态**

```bash
$ git rebase --abort
``` 

## 注意
- master分支**慎用reset**，与`git push -f`
- 本地分支推送远端强制覆盖时使用`git commit --force-with-lease` 
- 谨慎的对在你的仓库外有副本的分支执行rebase
- 尽量保持一个feat/hotfix/style/refactor/perf分支只使用一个提交。保持整个项目历史记录的干净。
