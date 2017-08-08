## ES2015 TEST SUITS
本项目是小白在学习**阮一峰老师**的[《ECMAScript 6 入门》](http://es6.ruanyifeng.com/)时的一个笔记，由于对测试很感兴趣，就将该书的内容、并结合[MDN(火狐开发者网站)](https://developer.mozilla.org/en-US/)，编写为**测试用例**。所以整个项目以测试示例为主，辅之以必要的知识点的讲解；

特点：

* 知识点源自[《ECMAScript 6 入门》](http://es6.ruanyifeng.com/)；
* 名词解释参考了[MDN(火狐开发者网站)](https://developer.mozilla.org/en-US/)；
* 内容以测试用例的方式展现；



#### Package Used
* karma
* jasmine
* webpack


#### Quick Start
安装依赖包：
在项目根目录下指行

```shell
 npm install
```

执行测试用例：

```shell
 npm run chapter [num] 
```

查看帮助：

```shell
npm run help

#运行结果：
Usage: npm run chapter [num]

选项：
  chapter  根据提供的章节号来执行具体的测试用例；   [数字]

章节：
  chapter 01   let and const
  chapter 02   variable destructuring
  chapter 03   string extend(not finish yet)
  chapter 04   regular express extend(not finish yet)
  chapter 05   math extend
  chapter 06   array extend
  chapter 07   function extend
  chapter 08   object extend
  chapter 09   Symbol
  chapter 10   Set and Map
  chapter 11   Proxy
  chapter 12   Reflect
  chapter 13   Promise
  chapter 14   Iterator
  chapter 15   Generator basic
  chapter 16   Generator async
  chapter 17   async function
  chapter 18   class basic
  chapter 19   class extend
  chapter all   run all chapter test suit
```

###问题：
> 1. Uncaught ReferenceError: jasmine is not defined 

解决方法：

打开文件：node_modules/karma-jasmine-html-reporter/src/index.js

做以下修改：

```javascript
  // 注释该段代码：
  // files.forEach(function(file, index) {
  //   if (JASMINE_CORE_PATTERN.test(file.pattern)) {
  //     jasmineCoreIndex = index;
  //   }
  // });
  //
  // files.splice(++jasmineCoreIndex, 0, createPattern(__dirname + '/css/jasmine.css'));
  // files.splice(++jasmineCoreIndex, 0, createPattern(__dirname + '/lib/html.jasmine.reporter.js'));
  // files.splice(++jasmineCoreIndex, 0, createPattern(__dirname + '/lib/adapter.js'));
  
  // 添加以下代码：
  files.push(createPattern(__dirname + '/css/jasmine.css'));
  files.push(createPattern(__dirname + '/lib/html.jasmine.reporter.js'));
  files.push(createPattern(__dirname + '/lib/adapter.js'));
  
  // 原理：更改debug.html页面加载文件顺序，
  // 优先加载所有jasmine-core相关文件，将html-reporter相关文件放在最后加载；
  
```

> 2. karma-jasmine-html-reporter无法实时刷新（livereload）

解决方法：

1. 在项目根目录下，将`/lib/socket.io.slim.js`、`/lib/livereload.js`文件复制到`/node_modules/karma-jasmine-html-reporter/src/lib`目录下；
2. 修改`node_modules/karma-jasmine-html-reporter/src/index.js`文件，在`initReporter`函数末尾添加以下代码

```javascript
  files.push(createPattern(__dirname + '/lib/socket.io.slim.js'));
  files.push(createPattern(__dirname + '/lib/livereload.js'));
```

最后，`node_modules/karma-jasmine-html-reporter/src/index.js`文件看起来是这样

```javascript
var initReporter = function(files,  baseReporterDecorator) {
  var jasmineCoreIndex = 0;

  baseReporterDecorator(this);

  // files.forEach(function(file, index) {
  //   if (JASMINE_CORE_PATTERN.test(file.pattern)) {
  //     jasmineCoreIndex = index;
  //   }
  // });
  //
  // files.splice(++jasmineCoreIndex, 0, createPattern(__dirname + '/css/jasmine.css'));
  // files.splice(++jasmineCoreIndex, 0, createPattern(__dirname + '/lib/html.jasmine.reporter.js'));
  // files.splice(++jasmineCoreIndex, 0, createPattern(__dirname + '/lib/adapter.js'));
  files.push(createPattern(__dirname + '/css/jasmine.css'));
  files.push(createPattern(__dirname + '/lib/html.jasmine.reporter.js'));
  files.push(createPattern(__dirname + '/lib/adapter.js'));

  // livereload相关文件
  files.push(createPattern(__dirname + '/lib/socket.io.slim.js'));
  files.push(createPattern(__dirname + '/lib/livereload.js'));
};
```
