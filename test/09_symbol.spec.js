describe ('Day 9: Symbol',function() {
    /**
     * Symbol
     * 它是一种新的原始数据类型，表示独一无二的值；
     *
     * 说明：
     *  ES5 的对象属性名都是字符串，这容易造成属性名的冲突。
     *  如果有一种机制，保证每个属性的名字都是独一无二的就好了，这样就从根本上防止属性名的冲突。
     *  这就是 ES2015 引入Symbol的原因。
     * */

    describe('1) 是一种新的原属数据类型',function() {
        it('1-1) 示例',function() {
            let s = Symbol();
            let x = Symbol();

            expect(typeof s).toBe('symbol');

            //上面的s,x是独一无二的值
            expect(s).not.toBe(x);
        });
    });

    describe('2) Symbol类型的值通过Symbol函数生成',function() {
        it('2-1) Symbol函数 可以接收一个字符串作为参数',function() {
            let s = Symbol('foo');
            let toStr = s.toString();
            expect(toStr).toBe('Symbol(foo)');
        });

        it('2-2) 如果Symbol函数的参数是一个对象，就会调用该对象的toString方法，将其转换成字符串',function() {
            let obj = {
                toString(){
                    return 'bar';
                }
            };
            s = Symbol(obj);
            toStr = s.toString();
            expect(toStr).toBe('Symbol(bar)');
        });

        it('2-3) Symbol函数前不可用new命令',function() {
           expect(function() {
               // 这是因为生成的Symbol 是一个原始类型的值，不是对象。
               let s = new Symbol();
           }).toThrow();
        });

    });
    describe('3) Symbol类型值',function() {
        it('3-1) Symbol值不能与其他类型进行运算',function() {
            expect(function() {
                let s = Symbol();
                s = s+'abc';
            }).toThrow();//TypeError: Cannot convert a Symbol value to a string

            //但是Symbol值可以显式地转为字符串
            let s = Symbol();
            let str = s.toString();
            expect(str).toBe('Symbol()');

        });

        it('3-2) Symbol值可以转为boolean',function() {
            let s = Symbol();
            let b1 = Boolean(s),b2 = !s;
            expect(b1).toBe(true);
            expect(b2).toBe(false);

            //但是不能转换为数值
            expect(function() {
                let n = Number(s);
            }).toThrow();

            expect(function() {
                let n = +s;
            }).toThrow();
        });

        it('3-3) Symbol类型值可以作为对象属性',function() {
            //Symbol函数的参数只是起描述性（提示性）作用
            let n = Symbol('name');
            let a = Symbol('age');
            let obj = {
                [n]: 'qy',
                [a]: 20
            };
            expect(obj[a]).toBe(20);
            expect(obj[n]).toBe('qy');
            /**
             * 因为Symbol类型值都是独一无二的，
             * 以Symbol类型值作为对象属性名，不会出现属性名重复冲突问题；
             * */

        });
    });

    describe('4) Symbol类型值作为属性名的遍历',function() {
        it('4-1) Symbol类型值作为属性名，不会被for...in遍历',function() {
            let name = Symbol('name');
            let hi = Symbol('hi');
            let obj = {
                [name]: 'qy',
                age: 11,
                [hi](arg){
                    return arg;
                }
            };

            let arr = [];
            for(let pp in obj){
                arr.push(pp);
            }
            expect(arr).toEqual(['age']);
        });

        it('4-2) Symbol类型值作为属性名,不会被Object.keys、Object.getOwnPropertyNames、JSON.stringify返回',function() {
            let name = Symbol('name'),
                hi = Symbol('hi'),
                obj = {
                    [name]: 'qy',
                    [hi](){},
                    age: 11
                };

            //Object.keys
            let keys = Object.keys(obj);
            expect(keys).toEqual(['age']);

            //Object.getOwnPropertyNames
            let names = Object.getOwnPropertyNames(obj);
            expect(names).toEqual(['age']);

            //JSON.stringify
            let str = JSON.stringify(obj);
            expect(str).toBe('{"age":11}');
        });

        it('4-3) 获取Symbol类型的属性名：Object.getOwnPropertySymbols',function() {
            let name = Symbol('name'),
                hi = Symbol('hi'),
                obj = {
                    [name]: 'qy',
                    [hi](){},
                    age: 11
                };

            let sArray = Object.getOwnPropertySymbols(obj);
            expect(sArray).toEqual([name,hi]);
        });
    });

    describe('5) Symbol.for(key)',function(){
        it('5-1) 根据key生成相同的Symbol类型值',function() {
            //生成一个Symbol类型值
            let s1 = Symbol.for('foo');

            //第二次调用，检查与foo对应的Symbol是否存在，并返回之前的Symbol值
            let s2 = Symbol.for('foo');
            expect(s1).toBe(s2);

            //而Symbol函数每次都生成不同的Symbol值
            let u1 = Symbol('foo');
            let u2 = Symbol('foo');
            expect(u1).not.toBe(u2);
        });
    });
    describe('6) Symbol.keyFor(str)',function() {
        it('6-1) 返回一个已经登记的Symbol值的key',function() {
            let s1 = Symbol.for('foo');
            let key = Symbol.keyFor(s1);
            expect(key).toBe('foo');

            //而通过Symbol函数生成的Symbol值是不登记的
            let u = Symbol('bar');
            key = Symbol.keyFor(u);
            expect(key).toBeUndefined();
        })
    });

    describe('7) ES6内置的Symbol值',function() {
        it('7-1) ) Symbol.hasInstance',function() {
            /**
             * 对象的Symbol.hasInstance属性，指向一个内部方法，
             * 该内部方法在使用instanceof操作符时被调用
             * */

            let spy = jasmine.createSpy(),
                obj = {
                    [Symbol.hasInstance]: spy
                };

            //执行instanceof判断
            ({} instanceof obj);
            //实际调用的是obj[Symbol.hasInstance]指向的函数
            expect(spy).toHaveBeenCalled();
        });
        
        it('7-2) Symbol.isConcatSpreadable',function() {
            /**
             * 对象的 Symbol.isConcatSpreadable属性为boolean类型，
             * 表示该对象使用Array.prototype.concat()时，是否可以展开
             * */

            let arr, src;


            arr = ['a','b'];
            src = [1,2];
            //arr默认是展开的
            src = src.concat(arr);
            expect(arr[Symbol.isConcatSpreadable]).toBeUndefined();
            expect(src).toEqual([1,2,'a','b']);

            arr = ['a','b'];
            src = [1,2];
            //arr关闭展开
            arr[Symbol.isConcatSpreadable] = false;
            src = src.concat(arr);
            expect(src).toEqual([1,2,['a','b']]);

            arr = ['a','b'];
            src = [1,2];
            //arr开启展开
            arr[Symbol.isConcatSpreadable] = true;
            src = src.concat(arr);
            expect(src).toEqual([1,2,'a','b']);

            // 类似数组的对象也可以通过concat展开，
            // 但默认是不展开的；
            let arrLike = {
                0: 'a',
                1: 'b',
                length: 2
            };
            src = [1,2];
            src = src.concat(arrLike);
            expect(arrLike[Symbol.isConcatSpreadable]).toBeUndefined();
            expect(src).toEqual([1,2,{0:'a',1:'b',length:2}]);

            arrLike[Symbol.isConcatSpreadable] = true;
            src = [1,2];
            src = src.concat(arrLike);
            expect(src).toEqual([1,2,'a','b']);
        });

        it('7-3) Symbol.species',function(){
            /**
             * 对象的Symbol.species属性 指定衍生对象的构造函数
             * */

            /**
             * 对于数组的map方法，它会调用Symbol.species指向的构造器生成新对象；
             * */
            class Array1 extends Array{
                hi(){}
            }
            let arr1 = new Array1(1,2,3);
            let arr1Map = arr1.map( x=>2*x);
            expect(arr1Map instanceof Array1).toBe(true);

            /**
             * 修改Symbol.species指向的构造器，来改变map函数生成的对象的类型
             * */
            class Array2 extends Array{
                static get [Symbol.species](){
                    return Array;
                }
            }
            let arr2 = new Array2();
            let arr2Map = arr2.map(x=>2*x);
            // arr2Map不再是Array2实例了；
            expect(arr2Map instanceof Array2).toBe(false);
            expect(arr2Map instanceof Array).toBe(true);
        });

        it('7-4) Symbol.match',function(){
            /**
             * 对象的Symbol.match属性，指向一个函数，指定字符串如何匹配正则表达式
             * 当String.prototype.match执行时，会调用它
             * */
            class MyMatcher{
                [Symbol.match](string){
                    return 'hi'.indexOf(string);
                }
            }
            let r = 'i'.match(new MyMatcher());
            expect(r).toBe(1);
        });

        it('7-5) Symbol.replace',function() {
            /**
             * 对象的Symbol.replace属性，指向一个方法，用来替换字符串中匹配的子字符串；
             * 当String.prototype.replace执行时，会调用它
             * */

            //下面两个栗子返回相同的结果
            let r1 = 'abc'.replace(/a/,'A');
            let r2 = /a/[Symbol.replace]('abc','A');
            expect(r1).toBe(r2);

            //另个例子
            let replaceObj = {
                [Symbol.replace](string,replaceStr){
                    return string+'|'+replaceStr
                }
            };
            let r3 = 'abc'.replace(replaceObj,'A');
            expect(r3).toBe('abc|A');
        });

        it('7-6) Symbol.search',function() {
            /**
             * 对象的Symbol.search属性，指向一个方法，该方法返回字符串中匹配正则表达式的部分的下标；
             * 当String.prototype.search执行时，会调用它
             * */

            //下面两个栗子返回相同的结果
            let r1 = 'abc'.search(/a/);
            let r2 = /a/[Symbol.search]('abc');
            expect(r1).toBe(r2);
        });

        it('7-7) Symbol.split',function() {
            /**
             * 对象的Symbol.split属性，指向一个方法，该方法分割字符串（按照匹配正则表达式的子字符串分割），以数组形式返回结果；
             * 当String.prototype.split执行时，会调用它
             * */

            //下面两个栗子返回相同的结果
            let r1 = 'a-b-c'.split(/-/);
            let r2 = /-/[Symbol.split]('a-b-c');
            expect(r1).toBe(r1);
        });

        it('7-8) Symbol.iterator',function() {
            /**
             * 对象的Symbol.iterator属性，指向该对象的默认遍历器；
             * */
            let myIterator = {};
            myIterator[Symbol.iterator] = function* (){
                yield 1;
                yield 2;
                yield 3;
            };

            let r = [...myIterator];
            expect(r).toEqual([1,2,3]);
        });

        it('7-9) Symbol.toPrimitive',function() {
            /**
             * 对象的Symbol.toPrimitive属性，指向一个方法，该方法可以将对象转化成原始类型值
             * 该对象被转换为原始类型值的时候，调用该方法
             * */

            //正常情况
            let obj1 = {};
            let number1 = +obj1;
            let string1 = `${obj1}`;
            expect(number1).toBeNaN();
            expect(string1).toBe('[object Object]');

            //now
            let obj2 = {
                [Symbol.toPrimitive](hint){
                    if(hint === 'number'){
                        return 11;
                    }
                    if(hint === 'string'){
                        return 'hi';
                    }
                    return true;
                }
            };
            let number2 = +obj2; //hint is 'number'
            let string2 = `${obj2}`; //hint is 'string'
            expect(number2).toBe(11);
            expect(string2).toBe('hi');
        });

        it('7-10) Symbol.toStringTag',function() {
            /**
             * 对象的Symbol.toStringTag属性，指向一个方法，用来生成一个对象的字符串描述；
             * 当Object.prototype.toString执行时，调用该方法
             * */

            //Javascript 类型的默认描述标签
            let toString = Object.prototype.toString;
            expect(toString.call('foo')).toBe('[object String]');
            expect(toString.call([1,2])).toBe('[object Array]');
            expect(toString.call(3)).toBe('[object Number]');
            expect(toString.call(true)).toBe('[object Boolean]');
            expect(toString.call(undefined)).toBe('[object Undefined]');
            expect(toString.call(null)).toBe('[object Null]');

            //其他的内置类型描述标签
            expect(toString.call(new Map())).toBe('[object Map]');
            expect(toString.call(function*(){})).toBe('[object GeneratorFunction]');
            expect(toString.call(Promise.resolve())).toBe('[object Promise]');

            //如果我们创建来自己的类，就会有默认的Object描述标签；
            class MyObj{}
            let myObj = new MyObj();
            expect(toString.call(myObj)).toBe('[object Object]');

            //现在，有了Symbol.toStringTag,我们可以设置自定义描述标签
            class CustomObj{
                get [Symbol.toStringTag](){
                    return 'Custom'
                }
            }
            let customObj = new CustomObj();
            expect(toString.call(customObj)).toBe('[object Custom]');
        });

        it('7-11) Symbol.unscopables',function() {
            /**
             * 对象的Symbol.unscopables 属性，指向一个对象，它用来将对象的自身属性和继承的属性排除在'with'的绑定环境外；
             * */

            //栗子1
            var obj = {
                foo: 1,
                bar: 2
            };

            // 将bar 排除在with 的绑定环境外
            obj[Symbol.unscopables] = {
                bar: true,
                foo: false
            };

            with(obj){
                expect(typeof bar).toBe('undefined');
                expect(foo).toBe(1);
            }

            //栗子2
            expect(Array.prototype[Symbol.unscopables]).toEqual({
                copyWithin: true,
                entries: true,
                fill: true,
                find: true,
                findIndex: true,
                includes: true,
                keys: true
            });

            let keys = 'hi';
            let push = 'hi';
            with(Array.prototype){
                //Array.prototype自身的属性keys 被排除在with环境外了；
                expect(keys).toBe('hi');

                //Array.prototype自身的属性push 没有排除在with环境外；
                expect(push).not.toBe('hi');

            }
        });
    });

});