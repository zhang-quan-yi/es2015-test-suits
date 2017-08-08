describe('Day 14: Iterator 和 for...of循环',function() {
    /**
     * Javascript原有的表示"集合"的数据结构，主要是Array 和Object ，ES2015 又添加了Map 和Set 数据结构；
     * 这样就需要一种统一的接口机制，来访问所有不同的数据结构，
     * Iterator 就是这一种机制。
     *
     * Iterator 是一种接口，为各种不同的数据结构提供来统一的访问机制。任何数据结构只要部署Iterator 接口，
     * 就可以完成它的遍历操作（依次访问它的所有成员）
     *
     * Iterator接口主要供for...of使用；
     *
     * */
    describe('1) Iterator(遍历器)',function() {
        it('1-1) 基本用法',function() {
            let map = new Map([
                                [0,'qy'],
                                [1,'hl']
                             ]);
            // map.entries 返回一个包含map所有值的Iterator对象；
            let iteratorObj = map.entries();

            // Iterator对象的next方法，从起始位置开始，依次返回该遍历器中的一个项目；
            // 每次执行next方法，Iterator对象内部位置就向下移动一位，取出该位置上的项目；
            let item1 = iteratorObj.next();
            expect(item1).toEqual({value: [0,'qy'],done: false});

            let item2 = iteratorObj.next();
            expect(item2).toEqual({value: [1,'hl'],done: false});

            let end = iteratorObj.next();
            expect(end).toEqual({value: undefined,done: true});

            // next方法返回的对象中有两个属性：value和done；
            // value 属性就是在当前位置，我们需要的值；
            // done 是一个boolean值，表示遍历操作是否结束；
        });

        it('1-2) 默认的Iterator接口', function() {
            /**
             * 默认的Iterator接口部署在数据结构的Symbol.iterator属性上，调用该接口，就会返回一个Iterator(遍历器)；
             * */

                // 我们可以改写上面"基本用法"中的demo
            let map = new Map([
                    [0, 'qy'],
                    [1, 'hl']
                ]);

            // 获取arr的默认Iterator接口，并调用，获取该arr的遍历器
            let iteratorObj = map[Symbol.iterator]();

            let item1 = iteratorObj.next();
            expect(item1).toEqual({value: [0, 'qy'], done: false});

            let item2 = iteratorObj.next();
            expect(item2).toEqual({value: [1, 'hl'], done: false});

            let end = iteratorObj.next();
            expect(end).toEqual({value: undefined, done: true});

            // 可以发现，Map数据结构的默认遍历器接口就是Map.prototype.entries方法；
            expect(map[Symbol.iterator]).toBe(map.entries);
            expect(Map.prototype[Symbol.iterator]).toBe(Map.prototype.entries);
        });

        it('1-3) 原生具备Iterator接口的数据结构',function() {
            // 数组的默认Iterator接口
            let arr = ['a', 'b', 'c'];
            let iteratorObj = arr[Symbol.iterator]();

            let item1 = iteratorObj.next();
            expect(item1).toEqual({value: 'a', done: false});

            let item2 = iteratorObj.next();
            expect(item2).toEqual({value: 'b', done: false});

            let item3 = iteratorObj.next();
            expect(item3).toEqual({value: 'c', done: false});

            let item4 = iteratorObj.next();
            expect(item4).toEqual({value: undefined, done: true});

            /**
             * 原生具备 Iterator接口的数据结构如下：
             *  Array
             *  Map
             *  Set
             *  String
             *  函数的 arguments对象
             * */
            expect(typeof Array.prototype[Symbol.iterator]).toBe('function');
            expect(typeof Map.prototype[Symbol.iterator]).toBe('function');
            expect(typeof Set.prototype[Symbol.iterator]).toBe('function');
            expect(typeof String.prototype[Symbol.iterator]).toBe('function');

            let foo = function() {return arguments[Symbol.iterator]};
            expect(typeof foo).toBe('function');
        });

        it('1-4) for...of会调用对象的默认Iterator接口',function(){
            // 默认的for...of行为
            let arr = ['a','b','c'];
            let result = [];
            for(let item of arr){
                result.push(item);
            }
            expect(result).toEqual(['a','b','c']);

            // 修改arr的默认遍历器;获取arr的所有键值对；
            arr[Symbol.iterator] = arr.entries;
            result.length = 0;

            for(let item of arr){
                result.push(item);
            }
            expect(result).toEqual([ [0,'a'],[1,'b'],[2,'c'] ]);
        });

        it('1-5) 自定义默认遍历器',function() {
            // 一个数据结构，只要部署了Symbol.iterator接口，就可以被类似for...of的操作遍历
            let obj = {
                name: 'qy',
                age: 11
            };
            obj[Symbol.iterator] = function(){
                let keys = Object.keys(this);
                let index = -1;
                return {
                    next: function(){
                        index++;
                        let key = keys[index];
                        let value = [key,obj[key]];
                        let done = index>keys.length;
                        return {value,done};
                    }
                }
            };

            // 这样obj对象就可以被for...of遍历了
            let result = [];
            for(let item of obj){
                result.push(item);
            }
            expect(result[0]).toEqual(['name','qy']);
            expect(result[1]).toEqual(['age',11]);
        });

        it('1-6) 字符串的Iterator接口',function() {
            /**
             * 字符串是一个类似数组的对象，也具有Iterator接口;
             * */
            let str = 'hi';
            let iterator = str[Symbol.iterator]();

            let item1 = iterator.next();
            expect(item1).toEqual({value: 'h', done: false});

            let item2 = iterator.next();
            expect(item2).toEqual({value: 'i', done: false});

            let item3 = iterator.next();
            expect(item3).toEqual({value: undefined, done: true});

            // 字符串可以运用扩展运算符
            let arr = [...str];
            expect(arr).toEqual(['h','i']);
        });

        it('1-7) Iterator接口与Generator函数',function() {
            /**
             * 因为Generator函数会返回一个遍历器对象，所以Symbol.iterator接口可以用Generator函数来实现；
             * */
            let obj = {};
            obj[Symbol.iterator] = function* (){
                yield 'a';
                yield 'b';
                yield 'c';
            };

            let r = [];
            for(let item of obj){
                r.push(item);
            }
            expect(r).toEqual(['a','b','c']);
        });

    });

    describe('2) 调用Iterator接口的场合',function() {
        let set = new Set(['a', 'b', 'c']);

        // 改写set的Iterator接口
        let oldIterator = set[Symbol.iterator];
        set[Symbol.iterator] = function() {
            count++;
            return oldIterator.call(this);
        };

        let count = 0;

        it('2-1) 场合1：解构赋值',function() {
            let [x,y] = set;
            expect(count).toBe(1);
        });

        it('2-2) 场合2：扩展运算符',function() {
            let result2 = [...set];
            expect(count).toBe(2);
        });

        it('2-3) 场合3：yield*',function() {
            let generatorFn = function* (){
                yield* set;
            };
            let generatorObj = generatorFn();
            expect(generatorObj.next()).toEqual({value: 'a',done: false});
            expect(generatorObj.next()).toEqual({value: 'b',done: false});
            expect(generatorObj.next()).toEqual({value: 'c',done: false});
            expect(generatorObj.next()).toEqual({value: undefined,done: true});
            expect(count).toBe(3);
        });

        it('2-4) 场合4：Array作为参数的地方；',function() {
            // 由于数组的遍历会调用遍历器接口，所以任何结束数组作为参数的场合，其实都调用了遍历器接口；
            let arrCount = 0;
            let arr = [ [0,'a'],[1,'b'],[2,'c'] ];

            // 改写arr的Iterator接口
            oldIterator = arr[Symbol.iterator];
            arr[Symbol.iterator] = function(){
                arrCount++;
                return oldIterator.call(this);
            };

            expect(arrCount).toBe(0);

            new Set(arr);
            expect(arrCount).toBe(1);

            Array.from(arr);
            expect(arrCount).toBe(2);

            for(let item of arr){}
            expect(arrCount).toBe(3);

            new Map(arr);
            expect(arrCount).toBe(4);

            Promise.all(arr).then(
                ()=>{},
                ()=>{}
            );
            expect(arrCount).toBe(5);
        });
    });

    describe('3) for...of循环',function() {
        /**
         * ES6 引入了for...of循环，作为遍历数据结构的统一的方法。
         * 一个数据结构只要部署了Symbol.iterator接口，就可以用for...of循环遍历它的成员。
         * */
        it('3-1) 遍历Array',function() {
            /**
             * 数组原生具备iterator接口
             * */
            let arr = ['a','b','c'];
            expect(typeof arr[Symbol.iterator]).toBe('function');

            let result = [];
            for(let item of arr){
                result.push(item);
            }
            expect(result).toEqual(['a','b','c']);
        });

        it('3-2) 遍历Set 解构',function() {
            /**
             * Set 结构原生具有Iterator 接口
             * */
            let set = new Set(['a','b','c']);
            expect(typeof set[Symbol.iterator]).toBe('function');

            let result = [];
            for(let item of set){
                result.push(item);
            }
            expect(result).toEqual(['a','b','c']);
            /**
             * for...of遍历set的顺序与成员添加到Set实例的顺序一致；
             * */
        });

        it('3-3) 遍历Map 解构',function() {
            /**
             * Map 解构原生具有Iterator 接口
             * */
            let map = new Map();
            map.set('name','qy');
            map.set('age',11);
            expect(typeof map[Symbol.iterator]).toBe('function');

            let result = [];
            for(let item of map){
                result.push(item);
            }
            expect(result).toEqual([ ['name','qy'],['age',11] ]);

            /**
             * for...of遍历map的顺序与成员添加到Map实例的顺序一致；
             * */
        });

        it('3-4) 遍历arrayLike Object',function() {
            /**
             * 可以用for...of 遍历的对象：
             * 1. 字符串；
             * 2. Dom NodeList对象
             * 3. 函数的arguments对象
             *
             * 不可以用for...of 遍历的对象
             * 1. 自定义的arrayLike 对象
             * */

            // 遍历arguments对象
            let args = (function(){return arguments})('a','b','c');
            let result = [];
            for(let item of args){
                result.push(item);
            }
            expect(result).toEqual(['a','b','c']);

            // 自定义arrayLike 对象,不可以用for...of遍历
            let obj = {
                length: 2,
                0: 'a',
                1: 'b'
            };
            expect(function() {
                for(let item of obj){

                }
            }).toThrow();
            // 需要自己实现Symbol.iterator接口；
            obj[Symbol.iterator] = function() {
                let length = this.length;
                let index = -1;
                let self = this;
                return {
                    next: function() {
                        index++;
                        return {value: self[index],done: index>=length};
                    }
                }
            };
            result = [];
            for(let item of obj){
                result.push(item);
            }
            expect(result).toEqual(['a','b']);
        });

        it('3-5) 可以被break、continue、throw、return中断循环',function() {
            let arr = [1,2,3];
            let r = [];
            for(let item of arr){
                if(item === 2){
                    break;
                }
                r.push(item);
            }
            expect(r).toEqual([1]);
        });
    });

    describe('4) 与其他遍历语法比较',function() {
        it('4-1) for 循环',function() {
            /**
             * for (let i=0;i<length;i++)
             *
             * 优点：
             *  1. 写法灵活
             *  2. 可以使用'break'、'continue' 关键字中断、跳过循环
             * */
        });

        it('4-2) forEach 循环',function() {
            /**
             * array.forEach(function callback(item,key){})
             *
             * 优点：
             *  1. 语法简单；
             * 缺点：
             *  1. 仅适用与数组类型；
             *  2. 不可以用'break'、'continue' 关键字
             *
             * */
        });

        it('4-3) for...in 循环',function() {
            /**
             * for(let propertyName in object){}
             *
             *  优点:
             *   1. 可以遍历对象；
             *  缺点：
             *   1. 遍历的顺序会根据具体的实现方式而有不同
             *   2. 遍历数组的时候，键会转化为字符串：'0'，'1'，'2'...
             *  注：
             *   1. 对象原型上的属性也会被for...in遍历；
             *
             * */
            let arr = ['a','b','c'];
            let result = [];
            for(let pp in arr){
                result.push(pp);
            }
            expect(result).toEqual(['0','1','2']);
        });

        it('4-4) for...of 循环',function() {
            /**
             * for(let item of obj){}
             *
             * 优点：
             *  1. 只要实现了Symbol.iterator接口，就可以被for...of遍历；
             *  2. 可以使用关键字'break'、'continue'、'return'
             * */
        });
    })
});