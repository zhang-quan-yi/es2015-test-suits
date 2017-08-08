// 在命令行界面进入node，并通过 --expose-gc开启手动垃圾回收机制；
$ node --expose-gc

// 手动执行一次垃圾回收；
> global.gc();
undefined

// 查看内存占用状态，heapUsed 为4M左右
> process.memoryUsage()
{ rss: 24969216,
  heapTotal: 8425472,
  heapUsed: 3804504,
  external: 8951 }

> let wm = new WeakMap();
undefined

> let key = new Array(5*1024*1024);
undefined

> wm.set(key,1);
WeakMap {}

> global.gc();
undefined

// 可以看到，增加数组key之后，heapUsed增加到45M了；
> process.memoryUsage();
{ rss: 67538944,
  heapTotal: 52486144,
  heapUsed: 45782816,
  external: 8945 }

// 清除外界对key的引用，但没有手动清除WeakMap对key的引用 
> key = null;
null

> global.gc();
undefined

// heapUsed 4M左右，
// 可以看到WeakMap对key的引用没有阻止gc对key所占内存的回收；
> process.memoryUsage();
{ rss: 25649152,
  heapTotal: 9474048,
  heapUsed: 3935160,
  external: 8979 }
 
