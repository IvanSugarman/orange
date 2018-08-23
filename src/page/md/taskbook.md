## 安装
```bash
$ npm install --global taskbook
```

## 配置
默认可以在`~/.taskbook.json`中根据喜好配置选项
```js
{
  // 初始化存储文件路径
  "taskbookDirectory": "", 
  // 显示标记为完成的任务
  "displayCompleteTasks": true,
  // 时间线和任务板视图下方显示进度概述
  "displayProgressOverview": true
}
```

## 用法

#### 视图
```bash
$ tb
```

#### 时间线视图
```bash
$ tb -i
```

#### 创建新任务
`--task/-t`并在后面跟上任务说明
```bash
$ tb -t Task-01
```

#### 创建新笔记
`--note/-n`并在后面跟上笔记正文
```bash
$ tb -n Note-01
```

#### 板块
如果创建笔记或者任务时，板块不存在，自动新建并初始化板块。将新任务指定给新板块，在任务描述前使用@加板块名称。
```bash
$ tb -t @block Task-02
```

#### 完成任务
`--check/-c`后跟ID, 转换成complete/pending状态
- 完成状态条目 -> -c -> 待处理
- 待处理任务条目 -> -c ->  完成状态条目
```bash
$ tb -c 1 3
```

#### 列出条目
可以列出某组条目，如列出属于默认值的所有条目`myboard`并且是待定任务
```bash
$ tb -l myboard pending
```

默认支持的列表属性以及别名如下
- `myboard` 属于`My Board`的条目
- `task`, `tasks`, `todo` - 作为任务的条目
- `note`, `notes` - 作为笔记的条目
- `pending`, `unchecked`, `incomplete` - 待处理的任务条目
- `done`, `checked`, `complete` - 待处理的任务条目
- `star`, `starred` - 已加星标的条目


#### 其他
```bash
# 星标
$ tb -s 1 2 3
# 设置优先级(p:x 或者-p @id x)
$ tb -t @coding Fix issue #42 p:3
$ tb -p @1 2
# 移动条目
$ tb -m @1 myboard reviews
# 删除条目
$ tb -d 1 2
# 显示存档
$ tb -a
# 还原条目
$ tb -r 1 2
```

#### github
- [taskbook](https://github.com/klauscfhq/taskbook/blob/master/docs/readme.ZH.md)
