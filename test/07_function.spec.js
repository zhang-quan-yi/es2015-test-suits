describe('Day 7: function extend', function() {
    describe('1) 默认参数', function() {
        it('1-1) 基本用法', function() {
            var hi = function(name = 'qy') {
                return name
            };

            expect(hi()).toBe('qy');
            expect(hi('')).toBe('');
            expect(hi(null)).toBe(null);
            expect(hi(undefined)).toBe('qy');
        });

        it('1-2) 函数参数是默认声明的,不能在函数內用let、const重复声明', function() {
            //这么写会报SyntaxError: Identifier 'name' has already been declared
            //var hi = function(name){let name='';};
        });

        it('1-3) 参数默认值的求值是惰性的', function() {
            //参数默认值不是传值的，而是每次都重新计算默认值表达式的值。
            let a,hi;

            hi = function(x = a + 1) {
                return x;
            };

            a = 100;
            expect(hi()).toBe(101);

            a = 1000;
            expect(hi()).toBe(1001);
        });

        it('1-4) 函数参数的解构传值', function() {
            var hi = function({x = 'va', y = 'vb'}) {
                    return {x: x, y: y};
                },
                r;
            r = hi({x: 1, y: 2});
            expect(r).toEqual({x: 1, y: 2});

            /**
             * hi(undefined);
             * hi(null);
             * hi();
             * 以上都会报错，因为参数是undefined、null，参数的解构赋值会失败；
             * */
            //r = hi();
            r = hi({});
            expect(r).toEqual({x: 'va', y: 'vb'});

            //为了避免函数参数解构赋值失败的问题，可以通过参数默认值来解决；
            hi = function({x = 'va', y = 'vb'} = {}) {
                return {x: x, y: y};
            };
            r = hi();
            expect(r).toEqual({x: 'va', y: 'vb'});
        });

        it('1-5) 应用：指定某个参数不能省略', function() {
            var throwIfMissing = function() {
                throw new Error('Missing Parameter');
            };

            var hi = function(name = throwIfMissing()) {
                return name;
            };
            expect(function() {
                hi();
            }).toThrowError('Missing Parameter');
        });
    });

    describe('2) 函数的length属性', function() {
        it('2-1) length为未指定默认值的参数的个数', function() {
            var hi;
            hi = function(a1, a2, a3) {
            };
            expect(hi.length).toBe(3);

            hi = function(a1, a2, a3 = '') {
            };
            expect(hi.length).toBe(2);
        });
    });

    describe('3) 作用域', function() {
        it('3-1) 设置了参数的默认值，参数会形成一个单独的作用域', function() {
            var hi,
                x = 'outer',
                r;

            hi = function(x, y = x) {
                return y
            };
            r = hi('inner');
            expect(r).toBe('inner');

            hi = function(y = x) {
                return y
            };
            r = hi();
            expect(r).toBe('outer');
        });
    });

    describe('4) rest参数', function() {
        it('4-1) 语法: ...var', function() {
            var r,
                hi = function(a, ...c) {
                    return c;
                };

            r = hi(1, 2, 3, 4, 5, 6);
            expect(r).toEqual([2, 3, 4, 5, 6]);
            expect(Array.isArray(r)).toBe(true);

            hi = function(...y) {
                return y
            };
            r = hi(1, 2, 3);
            expect(r).toEqual([1, 2, 3]);
        });

        it('4-2) 与解构赋值一起使用', function() {
            let [x, ...y] = [1, 2, 3];
            expect(x).toBe(1);
            expect(y).toEqual([2, 3]);
        })
    });

    describe('5) 扩展运算符：...', function() {
        it('5-1) 含义：将数组转化为逗号分隔的参数序列', function() {
            //demo1
            var hi  = function(a1, a2, a3) {
                    return a1 + a2 + a3;
                },
                arg = ['a', 'b', 'c'],
                r;

            r = hi(...arg);
            expect(r).toBe('abc');

            //demo2
            let arr  = ['a', 'b', 'c'],
                arr2 = [1, 2, 3];
            arr.push(...arr2);
            expect(arr).toEqual(['a', 'b', 'c', 1, 2, 3]);
        });

        it('5-2) 合并数组', function() {
            let arr,
                arr2 = [1, 2, 3];

            arr = ['a', ...arr2];
            expect(arr).toEqual(['a', 1, 2, 3]);
        });

        it('5-3) 展开字符串', function() {
            let arr = [...'hi'];
            expect(arr).toEqual(['h', 'i']);
        });

        it('5-4) 正确识别32位的Unicode', function() {
            var str = 'x\uD83D\uDE80y';
            expect(str.length).toBe(4);
            expect([...str].length).toBe(3);
        });

        it('5-5) 展开实现了Iterator接口的对象', function() {
            let obj = {a: 1,b: 2};

            // 为obj对象部署Iterator接口
            // 关于Iterator的详细内容请至第十四章；
            obj[Symbol.iterator] = function(){
                let keys = Object.keys(this);
                let i = -1;
                return {
                    next: function(){
                        i++;
                        return {value: 'k:' + keys[i],done: i>=keys.length}
                    }
                }
            };
            // 现在可以用扩展运算符把obj给展开了；
            let r = [...obj];
            expect(r).toEqual(['k:a','k:b']);
        });
    });

    describe('6) strict mode', function() {
        it('6-1) 从EcmaScript5开始，函数内部可以设置为严格模式', function() {
            expect(function() {
                var hi = function() {
                    'use strict';
                };
            }).not.toThrow();
        });

        it('6-2) 在EcmaScript2015中，函数内部就不能显式设定为严格模的情况;', function() {
            /**
             * 只要函数参数使用了默认值、解构赋值、或者扩展运算符，函数内部就不能显式设定为严格模;
             * */
            // Uncaught SyntaxError: Illegal 'use strict'
            // var hi = function(x,y=2){'use strict';}

            // Uncaught SyntaxError: Illegal 'use strict'
            // var hi = function({x,y}){'use strict';}

            // Uncaught SyntaxError: Illegal 'use strict'
            // var hi = function(x,...y){'use strict';}

            /**
             * 原因：
             * 函数内部的严格模式，适用函数参数和函数体的；但参数解析是优先于函数体的执行的，
             * 比如：
             * var hi = function(x=0123){'use strict';}
             * hi函数的参数x的默认值是八进制0123，但严格模式下不能使用前缀0表示八进制，所以应该报错；
             * 实际上，Js引擎会先成功执行x=0123,然后进入函数体內入，发现需要启用严格模式，这时才会报错；
             *
             * 因此，标准索性禁止了这种用法，只要参数使用了默认值、解构赋值、或者扩展运算符，就不能显式指定严格模式。
             * */
        });
    });

    describe('7) name属性', function() {
        it('7-1) 命名函数', function() {
            function foo() {
            }

            expect(foo.name).toBe('foo');
        });

        it('7-2) 匿名函数', function() {
            var bar = function() {
            };
            expect(bar.name).toBe('bar');
        });

        it('7-3) Function构造函数生成的函数', function() {
            expect((new Function()).name).toBe('anonymous');

            var baz = new Function();
            expect(baz.name).toBe('anonymous');
        });
    });

    describe('8) 箭头函数', function() {
        it('8-1) 基础用法', function() {
            // demo1: 函数只有一个参数、一行函数体；
            let foo = a1 => 1 + a1;
            expect(foo(100)).toBe(101);

            // demo2: 函数没有参数,有一行函数体；
            let bar = () => 100;
            expect(bar()).toBe(100);

            // demo3: 函数有多个参数，多行函数体
            let qy = (x, y) => {
                x = x + 1;
                y = y + 1;
                return {x: x, y: y};
            };
            expect(qy('a', 'b')).toEqual({x: 'a1', y: 'b1'});
        });

        it('8-2) 函数体內的this', function() {
            /**
             * 箭头函数体內但this是静态的，在定义时就确定的，
             * this值为函数定义时所在的上下文
             * */
            (function(){
                let hi = ()=>this.name;
                expect(hi()).toBe('qy');


                let foo = {
                    name: 'foo',
                    hi: hi
                };
                expect(foo.hi()).toBe('qy');

            }).call({name: 'qy'});

            /**
             * this实现机制
             * */
            (function(){
                let hi = ()=>this.name;
                // 相当于：
                let _this = this;
                let hi2 = function(){return _this.name};

                // 普通函数
                let hi3 = function(){return this.name};

                // 所以说箭头函数内的this对象是不可变的；
                let foo = {
                    name: 'foo',
                    hi,
                    hi2,
                    hi3
                };
                expect(foo.hi()).toBe('qy');
                expect(foo.hi2()).toBe('qy');
                expect(foo.hi3()).toBe('foo');


            }).call({name: 'qy'});
        });

        it('8-3) 不能当作构造函数',function() {
            let Foo = ()=>{this.name=''};
            expect(function() {
                new Foo();
            }).toThrow();
        });

        it('8-4) 没有自己的arguments对象',function() {
            ((a1,a2,a3)=>{
                let arg = Array.from(arguments);
                expect(arg).toEqual([]);
            })(1,2,3);
        });

        it('8-5) 不能用作 Generator 函数');
    });

    describe('9) 尾调用',function(){

    });
});