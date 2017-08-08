describe('Day 10: Set和 Map数据解构', function() {
    describe('1) Set数据解构', function() {
        /**
         * ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。
         * */
        describe('1-1) 基本用法', function() {
            it('1-1-1) Set构造函数：用来生成Set数据结构', function() {
                let s = new Set();
                s.add(2);
                s.add(2);
                s.add(2);
                expect(s.size).toBe(1);
                expect([...s]).toEqual([2]);

                //Set构造函数可以接收数组作为参数
                let s2 = new Set([1, 1, 1, 2, 2, 2]);
                expect(s2.size).toBe(2);
                expect([...s2]).toEqual([1, 2]);
            });

            it('1-1-2) Set内部成员之间相等的判断方式', function() {
                // 必须严格相等
                let s = new Set();
                s.add('5');
                s.add(5);
                expect(s.size).toBe(2);

                // 可以正确判断NaN
                let s2 = new Set([NaN, NaN]);
                expect(s2.size).toBe(1);
            });
        });

        describe('1-2) Set实例的属性和方法', function() {
            it('1-2-1) 属性：Set.prototype.constructor', function() {
                /**
                 *  默认就是 Set函数
                 * */
                let s = new Set();
                let c = s.constructor;
                expect(c).toBe(Set);
            });

            it('1-2-2) 属性：Set.prototype.size', function() {
                /**
                 *  返回Set实例成员总数
                 * */
                let s = new Set([0, -0, NaN, NaN, {a: 1}, {a: 1}]);
                expect(s.size).toBe(4);
                expect([...s]).toEqual([0, NaN, {a: 1}, {a: 1}]);
            });

            it('1-2-3) 方法：Set.prototype.add(value)', function() {
                /**
                 * 为当前实例添加新值，
                 * 返回：
                 *  当前实例
                 * */
                let s = new Set();
                s.add(1);
                expect(s.size).toBe(1);
            });

            it('1-2-4) 方法：Set.prototype.delete(value)', function() {
                /**
                 * 删除某个值
                 * 返回：
                 *  一个boolean值，删除成功为true，失败为false
                 * */
                let s = new Set([1, 2, 3]);
                let r = s.delete(1);
                expect(s.size).toBe(2);
                expect(r).toBeTruthy();

                r = s.delete(1);
                expect(r).toBeFalsy();
            });

            it('1-2-5) 方法：Set.prototype.has(value)', function() {
                /**
                 * 判断某个值是否为Set实例的成员
                 * 返回：
                 *  boolean值
                 * */
                let s = new Set([1, 2, 3]);
                expect(s.has(1)).toBe(true);
                expect(s.has(0)).toBe(false);

            });

            it('1-2-6) 方法：Set.prototype.clear()', function() {
                /**
                 * 清除当前实例的所以成员
                 * */
                let s = new Set([1, 2, 3]);
                expect(s.size).toBe(3);

                s.clear();
                expect(s.size).toBe(0);
            });
        });

        describe('1-3) 遍历操作', function() {
            it('1-3-1) 方法：Set.prototype.values()', function() {
                /**
                 * 返回一个新的遍历器对象，包含了当前Set实例的所有成员；
                 * 遍历器对象中成员的顺序与Set中成员插入的顺序一致；
                 * */
                let s = new Set([1, 2]);
                s.add('bb');
                s.add('foo');
                let v = s.values();
                expect([...v]).toEqual([1, 2, 'bb', 'foo']);
            });

            it('1-3-2) 方法：Set.prototype.keys()', function() {
                /**
                 * 返回一个新的遍历器，包含了当前Set实例的键名；
                 * 由于Set解构没有键名，只有键值，所以该方法和Set.prototype.values方法表现一致；
                 * */
                let s = new Set(['a', 'b', 'c']);
                let k = s.keys();
                expect(k.next()).toEqual({value: 'a', done: false});
                expect(k.next()).toEqual({value: 'b', done: false});
                expect(k.next()).toEqual({value: 'c', done: false});
                expect(k.next()).toEqual({value: undefined, done: true});
            });

            it('1-3-3) 方法：Set.prototype.entries()', function() {
                /**
                 * 返回一个新的遍历器，包含了当前Set实例的键值对；
                 * */
                let s = new Set(['a', 'b', 'c']);
                let e = s.entries();
                let entriesArray = Array.from(e);
                expect(entriesArray).toEqual([['a', 'a'], ['b', 'b'], ['c', 'c']]);
                // Set解构的键和值是一样的。。。
            });

            it('1-3-4) 方法：Set.prototype.forEach(callback[,thisArg])', function() {
                /**
                 * 按照成员插入Set的顺序遍历Set成员，为每个Set成员执行callback函数；
                 * */
                let s = new Set();
                s.add('qy');
                s.add('aa');
                s.add('x.x');

                let arr = [];
                s.forEach(function(value, key, currentSet) {
                    arr.push({value, key, currentSet, prefix: this.prefix});
                }, {prefix: 'ES6'});

                expect(arr[0]).toEqual({value: 'qy', key: 'qy', currentSet: s, prefix: 'ES6'});
                expect(arr[1]).toEqual({value: 'aa', key: 'aa', currentSet: s, prefix: 'ES6'});
                expect(arr[2]).toEqual({value: 'x.x', key: 'x.x', currentSet: s, prefix: 'ES6'});
            });

            it('1-3-5) Set实例可以通过for...of遍历，是通过实例的values方法生成默认的遍历器', function() {
                let r = Set.prototype[Symbol.iterator] === Set.prototype.values;
                expect(r).toBe(true);
            });
        });

    });

    describe('2) WeakSet数据结构', function() {
        /**
         * WeakSet是用于存储对象的集合，且成员值都是唯一的；
         * 与Set数据结构相比，主要有两点区别：
         * 1. WeakSet仅能存储对象数据类型；
         * 2. WeakSet对成员对象的引用都是弱引用；垃圾回收机制不考虑 WeakSet 对该对象的引用，
         *    也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占用的内存;
         * */
        describe('2-1) 基本用法', function() {
            it('2-1-1) WeakSet构造函数', function() {
                let w = new WeakSet();
                let obj = {a: 1};
                w.add(obj);
                let r = w.has(obj);
                expect(r).toBeTruthy();

                let obj2 = {a: 1},
                    obj3 = {b: 2};
                let w2 = new WeakSet([obj2, obj3]);
                expect(w2.has(obj2)).toBeTruthy();
                expect(w2.has(obj3)).toBeTruthy();

            });

            it('2-1-2) 没有size属性、无法遍历它的成员', function() {
                let w = new WeakSet();
                expect(w.size).toBeUndefined();
                expect(w.forEach).toBeUndefined();
                /**
                 * 是因为成员都是弱引用，随时可能消失，遍历机制无法保证成员的存在，很可能刚刚遍历结束，成员就取不到了。
                 * */
            });

            it('2-1-3) 只接收对象成员', function() {
                let w = new WeakSet();
                let obj = {a: 1};

                expect(function() {
                    w.add(1);
                }).toThrowError('Invalid value used in weak set');

                expect(function() {
                    w.add(obj);
                }).not.toThrow();
            });
        });

        describe('2-2) 实例属性和方法', function() {
            it('2-2-1) 属性：WeakSet.prototype.constructor', function() {
                /**
                 * 指向生成WeakSet实例的构造函数，默认为WeakSet
                 * */
                let w = new WeakSet();
                expect(w.constructor).toBe(WeakSet);
            });

            it('2-2-2) 方法：WeakSet.prototype.add(value)', function() {
                /**
                 * 为WeakSet实例添加新对象成员
                 * */
                let w = new WeakSet();
                let o = {a: 1};
                w.add(o);
                expect(w.has(o)).toBeTruthy();
            });

            it('2-2-3) 方法：WeakSet.prototype.delete(value)', function() {
                /**
                 * 删除与value值相关的成员；之后调用WeakSet.prototype.has(value)将返回false;
                 * */
                let obj = {a: 1};
                let w = new WeakSet([obj]);
                expect(w.has(obj)).toBeTruthy();
                w.delete(obj);
                expect(w.has(obj)).toBeFalsy();
            });

            it('2-2-4) 方法：WeakSet.prototype.has(value)', function() {
                /**
                 * 判断value值是否是WeakSet实例的成员
                 * 返回：
                 *  boolean值类型
                 * */
                let w = new WeakSet();
                let obj1 = {a: 1};
                let obj2 = {a: 1};
                w.add(obj1);
                expect(w.has(obj1)).toBeTruthy();
                expect(w.has(obj2)).toBeFalsy();
            });
        });
    });

    describe('3) Map数据结构', function() {
        /**
         * Map数据结构和对象类似，是键值对的集合；但是不同的是Map的键不限于字符串；
         * 也就是说，Object对象提供了"字符串"与"值"的对应，Map结构提供了"值"与"值"的对应；
         * */
        describe('3-1) 基础用法', function() {
            it('3-1-1) Map构造函数',function() {
                // 创建新的Map实例
                let map = new Map();
                expect(Object.prototype.toString.call(map)).toBe('[object Map]');

                // 也可以接收参数，比如数组
                let map2 = new Map([
                    ['name', 'qy'],
                    ['age', 11]
                ]);
                expect(map2.get('name')).toBe('qy');
                expect(map2.get('age')).toBe(11);

                // Map构造函数不仅仅可以接收数组，
                // 只要是具有Iterator接口的数据结构都可以，比如Set结构和Map结构
                let s = new Set([['a',1],['b',2]]);
                let map3 = new Map(s);
                expect(map3.get('a')).toBe(1);
                expect(map3.get('b')).toBe(2);
            });

            it('3-1-2) 通过"set"方法设置值、"get"方法获取值',function() {
                let m = new Map();
                m.set('a',1);
                expect(m.get('a')).toBe(1);
            });

            it('3-1-3) 可以使用其他类型值作为键值', function() {
                let key   = {name: 'qy'},
                    key2 = {name: 'hl'},
                    value = {age: 11};

                // Object对象不支持对象最为键，它会把对象转化成字符串作为键；
                let obj = {};
                obj[key] = value;
                let objKeys = Array.from(Object.keys(obj));
                expect(objKeys).toEqual(['[object Object]']);
                expect(obj['[object Object]']).toBe(value);
                // 将key换成任何对象都会转换成字符串 '[object Object]';
                expect(obj[{}]).toBe(value);

                // 而Map数据结构可以以其他类型作为健;
                let map = new Map();
                map.set(key,value);
                expect(map.get(key)).toBe(value);
                expect(map.get({})).toBeUndefined();
            });

            it('3-1-4) 设置键值时，健相等的情况下，值会被覆盖',function() {
                let m = new Map();
                m.set('a',1);
                m.set('a',2);
                expect(m.get('a')).toBe(2);
            });

            it('3-1-5) 键的相等判断',function() {
                let m = new Map();

                /**
                 * 引用类型都是不想等的
                 * */
                let key1 = {};
                let key2 = {};

                m.set(key1,1);
                m.set(key2,2);
                //key1对应的值没有变，还是1；
                expect(m.get(key1)).toBe(1);

                /**
                 * -0和+0相等
                 */
                let positiveZero = 0;
                let negativeZero = -0;
                m.set(positiveZero,1);
                m.set(negativeZero,2);
                //positiveZero对应的值被覆盖了；
                expect(m.get(positiveZero)).toBe(2);

                /**
                 * NaN与NaN是相等的
                 * */
                m.set(NaN,1);
                m.set(NaN,2);
                expect(m.get(NaN)).toBe(2);
            });
        });

        describe('3-2) Map实例属性和方法',function() {
            it('3-2-1) 属性：Map.prototype.size',function() {
                let m = new Map(),s=0;
                m.set('a',1);
                s = m.size;
                expect(s).toBe(1);

                m.set('name','qy');
                s = m.size;
                expect(s).toBe(2);
            });

            it('3-2-2) 方法：Map.prototype.set(key,value)',function() {

            });

            it('3-2-3) 方法：Map.prototype.get(key)',function() {

            });

            it('3-2-4) 方法：Map.prototype.has(key)',function() {
                /**
                 * 用来测试某个key在Map实例中是否有值
                 * 返回：
                 *  boolean值
                 * */
                let m = new Map();
                m.set('a',1);
                expect(m.has('a')).toBeTruthy();
                expect(m.has('b')).toBeFalsy();
            });

            it('3-2-5) 方法：Map.prototype.delete(key)',function() {
                /**
                 * 删除某个键；
                 * 返回：
                 *  boolean，成功为true，失败为false
                 * */
                let m = new Map(),
                    r=null;

                m.set('a',1);
                r = m.delete('a');
                expect(r).toBeTruthy();
                expect(m.has('a')).toBeFalsy();

                r = m.delete('unknown');
                expect(r).toBeFalsy();
            });

            it('3-2-6) 方法： Map.prototype.clear()',function() {
                /**
                 * 清除Map实例的所有成员
                 * 无返回值
                 * */
                let m = new Map();
                m.set('a',1);
                m.set('b',2);
                expect(m.size).toBe(2);

                m.clear();
                expect(m.size).toBe(0);
            });
        });

        describe('3-3) 遍历方法',function() {
            it('3-3-1) 方法：Map.prototype.keys()',function() {
                /**
                 * 返回一个遍历器对象，该对象包含了Map实例的所有键名，按照Map实例成员插入的顺序遍历；
                 * */
                let m = new Map([ ['a',1],['b',2] ]);
                let iterator = m.keys();
                let toArray = Array.from(iterator);
                expect(toArray).toEqual(['a','b']);
            });

            it('3-3-2) 方法：Map.prototype.values()',function() {
                /**
                 * 返回一个遍历器对象，该对象包含了Map实例的所有值，按照Map实例成员插入的顺序遍历；
                 * */
                let m = new Map([ ['a',1],['b',2] ]);
                let iterator = m.values();
                let toArray = Array.from(iterator);
                expect(toArray).toEqual([1,2]);
            });

            it('3-3-3) 方法：Map.prototype.entries()',function() {
                /**
                 * 返回一个遍历器对象，该对象包含了Map实例的所有键-值对，按照Map实例成员插入的顺序遍历；
                 * */
                let m = new Map([ ['a',1],['b',2] ]);
                let iterator = m.entries();
                let toArray = Array.from(iterator);
                expect(toArray).toEqual([ ['a',1],['b',2]]);
            });

            it('3-3-4) 方法：Map.prototype.forEach(callback[,thisArg])',function() {
                /**
                 * 遍历Map实例，对每个成员执行callback函数；
                 * */
                let m = new Map([ ['a',1],['b',2] ]);
                let arr = [];
                m.forEach(function(value,index,currentMap){
                    arr.push({value,index,currentMap,prefix: this.prefix});
                },{prefix: 'ES6'});

                expect(arr[0]).toEqual({value: 1,index: 'a',currentMap: m,prefix: 'ES6'});
                expect(arr[1]).toEqual({value: 2,index: 'b',currentMap: m,prefix: 'ES6'});
            });

            it('3-3-5) Map实例的默认遍历器接口是"entries"方法',function() {
                expect(Map.prototype[Symbol.iterator]).toBe(Map.prototype.entries);

                //栗子
                let m = new Map([ ['a',1] ]),
                    r1 = [],
                    r2 = [];
                for(let [key,value] of m){
                    r1.push(key,value);
                }
                for(let [key,value] of m.entries()){
                    r2.push(key,value);
                }
                expect(r1).toEqual(r2);
            });


        });
    });

    describe('4) WeakMap',function() {
        /**
         * WeakMap数据结构是一个key/value对的集合，但key必须是对象、value可以是任何类型；
         * 注：WeakMap的key都是弱引用
         * */
        describe('4-1) 创建WeakMap实例',function(){
            it('4-1-1） 示例',function() {
                //不带参数
                let wM = new WeakMap();
                expect(Object.prototype.toString.call(wM)).toBe('[object WeakMap]');

                //带参数
                let wM2 = new WeakMap([
                    [{name:'qy'},1],
                    [{name:'hl'},2]
                ]);
                expect(Object.prototype.toString.call(wM2)).toBe('[object WeakMap]');

                //设置
                let key = {},
                    value=1;
                wM.set(key,value);

                //判断WeakMap实例是否拥有某个键；
                let r = null;
                r = wM.has(key);
                expect(r).toBeTruthy();

                //获取key对应的值
                r = wM.get(key);
                expect(r).toBe(value);
            });
        });

        describe('4-2) WeakMap实例但属性和方法',function() {
            it('4-2-1) 属性：WeakMap.prototype.constructor',function() {
                /**
                 * 指向创建实例原型的函数，默认为WeakMap；
                 * */
                let wM = new WeakMap();
                expect(wM.constructor).toBe(WeakMap);
            });

            it('4-2-2) 方法：WeakMap.prototype.set(key,value)',function(){
               /**
                * 将WeakMap实例的key键所对应的值设置为value；
                * key: 类型只能为对象；
                * value: 任何类型；
                *  返回：
                *  WeakMap实例自身；
                * */
                let wM = new WeakMap();
                let key = {},value=1;
                let r = wM.set(key,value);
                expect(r).toEqual(wM);
                expect(wM.has(key)).toBeTruthy();

                //key必须为对象
                expect(function() {
                    wM.set('a',1);
                }).toThrowError('Invalid value used as weak map key');
            });

            it('4-2-3) 方法：WeakMap.prototype.get(key)',function() {
                /**
                 * 获取WeakMap中与key关联的值，如果不存在该key，则返回undefined;
                 * */
                let wM = new WeakMap();
                let k = {},v = 1;
                wM.set(k,v);
                expect(wM.get(k)).toBe(v);

                expect(wM.get({'x.x': 'x.x'})).toBeUndefined();
            });

            it('4-2-4) 方法： WeakMap.prototype.has(key)',function() {
                /**
                 * 判断WeakMap实例中，key键是否关联了一个值；
                 * 返回：
                 *  true：有值与key关联；
                 *  false：没有值与key关联；
                 * */
                let k = {},v = 1;
                let wM = new WeakMap([ [k,v] ]);
                expect(wM.has(k)).toBeTruthy();

                let unknownKey = {'x.x': 'x.x'};
                expect(wM.has(unknownKey)).toBeFalsy();
            });

            it('4-2-5) 方法：WeakMap.prototype.delete(key)',function() {
                /**
                 * 删除任何一个与key关联的值，并且随后WeakMap.prototype.has(key)将返回false
                 * */
                let wM = new WeakMap();
                let k = {},v = 1;
                wM.set(k,v);
                expect(wM.has(k)).toBeTruthy();

                wM.delete(k);
                expect(wM.has(k)).toBeFalsy();
            });

            it('4-2-6) 没有遍历操作，也没有size属性',function() {
                let wM = new WeakMap();
                expect(typeof wM.key).toBe('undefined');
                expect(typeof wM.values).toBe('undefined');
                expect(typeof wM.entries).toBe('undefined');
                expect(typeof wM.size).toBe('undefined');
            });
        });

        describe('4-3) 用途',function() {
            it('4-3-1) 以DOM节点为键名',function() {
               /**
                * 记录ele被点击的次数；
                * */
               //模拟dom API
               let document = {};
               document.getElementById = function(id) {return {id,onclick(){}}};

               let element = document.getElementById('myButton');

               let weakMap = new WeakMap();
                weakMap.set(element,0);

                element.onclick(function(){
                    let times = weakMap.get(element);
                    times++;
                    //...
                });

                /**
                 * 当element节点删除后，weakMap对element的引用就会自动消失，避免类内存泄露；
                 * */
            });
            it('4-3-2） 部署私有属性',function() {
                const privateProperty1 = new WeakMap();
                const privateProperty2 = new WeakMap();

                class MyClass{
                    constructor(property1,property2){
                        privateProperty1.set(this,property1);
                        privateProperty2.set(this,property2);
                    }
                    doSomethingToP1(){
                        let p1 = privateProperty1.get(this);
                        //...
                        //...
                        return p1;
                    }
                    doSomethingToP2(){
                        let p2 = privateProperty2.get(this);
                        //...
                        //...
                        return p2
                    }
                }

                let myClass = new MyClass(1,2);
                myClass.doSomethingToP1();
                myClass.doSomethingToP2();

                myClass = null;

                /**
                 * 上面代码中，privateProperty1和privateProperty2对实例myClass 是弱引用，
                 * 如果删除myClass，privateProperty1和privateProperty2对myClass 的引用也会删除；
                 * */
            });
        });

        describe('4-4) 内存测试',function() {
            it('4-4-1) 可以通过node命令行测试，具体见文件./weakmap_memory_test.sh',function() {});
        });
    });
});
