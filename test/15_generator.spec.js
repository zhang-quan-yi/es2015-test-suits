describe('Day 15: Generator',function(){

    /**
     * generator 函数的声明：
     *  语法：
     *   function* name (...arguments){}
     *  即'function'关键字后跟一个'*'星号就声明了一个generator 函数；
     *
     * generator 对象：
     *   generator 对象由上述的generator 函数返回，是一个遍历器，确切的说，generator 对象同时遵循iterable 协议和iterator 协议；
     *   1. 遵循iterable 协议: 说明generator 对象是可遍历的（iterable），该对象实现了Symbol.iterator接口(关于遍历器相关内容，见14_iterator.spec.js)；
     *   2. 遵循iterator 协议: 说明generator 对象实现了遍历器的next()方法;
     *      next()方法：
     *        该方法会返回一个对象，该对象以下两个属性：
     *        done： 一个boolean值，表示遍历器是否遍历结束；
     *        value： 任何类型，为generator 函数中，yield关键字后面表达式的值；
     *
     * generator 函数特点：
     *  generator 函数在调用后不会立即执行自身的函数体，只会返回一个遍历器（iterator）；在之后调用遍历器的next方法时，会恢复
     *  generator 函数的执行，当执行到'yield'语句时退出函数体，并返回该yield语句后面跟着的表达式的值；再次调用遍历器的next方法时，
     *  会再次恢复 generator 函数，从上次中止的地方继续执行；
     *  generator 函数中遇到'return' 表达式，会使遍历器变成执行完毕状态；generator 函数返回后，不会再执行任何yield语句；
     * */
    describe('1) 基本用法', function() {
        it('1-1) generator 函数和generator 对象', function() {
            // 声明一个generator 函数
            function* foo() {
                let i = 0;
                yield 'step' + i;
                i++;
                yield 'step' + i;
                i++;
                yield 'step' + i;
            }

            // generator 对象
            let gen = foo();

            // gen 对象是iterable（可遍历）的,它实现了Symbol.iterator属性(关于遍历器相关内容，见14_iterator.spec.js)
            expect(typeof gen[Symbol.iterator]).toBe('function');
            expect(gen[Symbol.iterator]()).toBe(gen);

            // gen对象是一个遍历器，它实现了next方法
            expect(typeof gen.next).toBe('function');

            let result = null;

            result = gen.next();
            // 执行遍历器的next 方法；
            // 此时会恢复foo 函数的执行，执行以下语句：
            // line 29： let i = 0;
            // line 30： yield 'step' + i;
            // 并在line 30 的 yield 语句处停止执行并退出foo 函数，返回yield语句后面跟着的表达式'step'+i 的值；
            expect(result).toEqual({value: 'step0', done: false});

            result = gen.next();
            // 执行遍历器的next 方法；
            // 再次恢复foo 函数的执行，从上次中止的地方执行以下语句：
            // line 31： i++;
            // line 32： yield 'step' + i;
            // 并在 line 32 的 yield 语句处停止执行并退出foo 函数，返回yield语句后面跟着的表达式'step'+i 的值；
            expect(result).toEqual({value: 'step1', done: false});

            result = gen.next();
            // 执行遍历器的next 方法；
            // 再次恢复foo 函数的执行，从上次中止的地方执行以下语句：
            // line 33： i++;
            // line 34： yield 'step' + i;
            // 并在 line 34 的 yield 语句处停止执行并退出foo 函数，返回yield语句后面跟着的表达式'step'+i 的值；
            expect(result).toEqual({value: 'step2', done: false});

            result = gen.next();
            // 再次执行gen.next 方法，此时foo 函数內的语句结束，会自动 return；
            // 遍历器达到结束状态，即value值为undefined，done值为true
            expect(result).toEqual({value: undefined, done: true});

        });
    });
    describe('2) yield 关键字', function() {
        /**
         * yield 关键字用于暂停一个generator 函数的内部执行，yield 关键字后面跟着的表达式的值将会被返回给调用环境；
         * 注： yield关键词只能出现在generator函数内部
         * */
        it('2-1) 可以看作是基于generator 函数的return语句', function() {
            function* foo() {
                let i = 0;
                i++;
                yield 'step' + i;
                i++;
                yield 'step' + i;
            }

            let g = foo();

            let result = null;

            result = g.next();
            expect(result.value).toBe('step1');

            result = g.next();
            expect(result.value).toBe('step2');

            result = g.next();
            expect(result.done).toBe(true);

            /**
             * yield 语句与return 语句不同之处在于：
             * 1. 在generator 函数中，yield语句可以出现多次，并且都会执行；而函数的return 语句只可以执行一次；
             * 2. 在generator 函数中，遇到return 语句,遍历器将结束遍历；
             * 3. yield 语句只出现在generator 函数中
             * */

            // 在generator 函数中，遇到return 语句,遍历器将结束遍历；
            // return 语句之后的代码不会执行
            function* foo2() {
                return 1;
                yield 2;
                yield 3;
            }

            let g2 = foo2();
            let result2 = null;

            result2 = g2.next();
            expect(result2.value).toBe(1);
            expect(result2.done).toBe(true);
        });

        it('2-2) yield 语句可以出现在其他表达式中', function() {
            function* foo() {
                let i = null;
                i = '1: ' + (yield 'step1');
                yield i;
            }

            let g = foo();
            let result = null;

            result = g.next();
            expect(result.value).toBe('step1');

            result = g.next();
            expect(result.value).toBe('1: undefined');

            /**
             * 注：
             *  上面的结果出现了 '1： undefined'，也就是最后 i变量的值；那么这个结果是怎么得到的呢？
             * */
        });

        it('2-3) yield 语句的值与遍历器next方法的参数', function() {
            let i;
            function* foo1() {
                i = (yield 1);
            }
            let g1,
                result;
            g1 = foo1();

            // 调用next 方法，
            // 恢复foo1 函数的执行，执行下列语句：
            // line 155: (yield 1)
            // 并在(yield 1)语句处中止退出foo1 函数
            g1.next();

            // 调用next 方法，
            // 恢复foo1 函数的执行，执行：
            // line 155: i = (yield 1)
            // 自动结束foo1 函数的执行（函数的语句执行完了）
            g1.next();
            expect(i).toBe(undefined);

            // next 方法参数
            let a = null,
                b = null;

            function* foo2() {

                a = (yield 1);
                b = (yield 2);
            }

            let g2 = foo2();

            // 调用next 方法，
            // 恢复foo2 函数的执行，执行：
            // line 180: (yield 1)
            // 并在(yield 1)语句处中止退出foo2 函数
            g2.next();

            // 调用next 方法，
            // 恢复foo2 函数的执行，从上次中止的地方继续执行,并将参数'arg1'传入foo2函数作为上一步（yield 1）表达式的值：
            // line 180: a = (yield 1)
            // line 181: (yield 2)
            // 在(yield 2)语句处中止退出foo2 函数
            g2.next('arg1');
            expect(a).toBe('arg1');
            // 因为只执行到了line 181: (yield 2)部分函数foo2 就退出了，对变量b的赋值还未执行到
            expect(b).toBe(null);

            // 调用next 方法，
            // 恢复foo2 函数的执行，从上次中止的地方继续执行,并将参数'arg2'传入foo2函数作为上一步（yield 2）表达式的值：
            // line 181: b = (yield 2)
            // 自动结束foo2 函数的执行（函数的语句执行完了）
            g2.next('arg2');
            expect(a).toBe('arg1');
            expect(b).toBe('arg2');

            // next方法的参数将会作为上一次yield语句的整体值；

        });
    });

    describe('3) yield* 用法', function() {
        it('3-1) yield 后跟一个generator对象', function() {
            function* inner() {
                yield 'inner1';
                yield 'inner2';
            }

            let innerGenerator = inner();

            function* foo() {
                yield innerGenerator;
            }

            let g = foo();
            let result = g.next();
            expect(result.value).toBe(innerGenerator);
        });

        it('3-2) yield* 后跟一个generator对象', function() {
            function* inner() {
                yield 'inner1';
                yield 'inner2';
            }

            let innerGenerator = inner();

            function* foo() {
                yield* innerGenerator;
            }

            let g = foo();
            let result1 = g.next();
            let result2 = g.next();
            expect(result1.value).toBe('inner1');
            expect(result2.value).toBe('inner2');

            /**
             * 没错，yield* 会把遍历器对象展开；
             *
             * */
        });

        it('3-3) yield* 后跟一个generator 对象，该generator 有return 语句',function() {
            function* inner () {
                yield 'inner1';
                yield 'inner2';
                return 'inner';
            }
            let result;
            function* foo(){
                result = yield* inner();
            }
            let g= foo();
            expect(g.next()).toEqual({value: 'inner1', done: false});
            expect(g.next()).toEqual({value: 'inner2', done: false});
            // 执行到 inner 到return 语句之后，yield* 语句到遍历就结束了，return 语句的返回值会赋值给result变量；
            expect(g.next()).toEqual({value: undefined, done: true});
            expect(result).toBe('inner');
        });

        it('3-4) yield* 后跟一个遍历器对象', function() {
            let arr = [1, 2];
            // 获取遍历器对象
            let arrIterator = arr[Symbol.iterator]();

            function* foo() {
                yield* arrIterator;
            }

            let g = foo();
            let result1 = g.next();
            let result2 = g.next();
            let end = g.next();
            expect(result1.value).toBe(1);
            expect(result2.value).toBe(2);
            expect(end).toEqual({value: undefined, done: true});
        });
    });

    describe('4) Generator.prototype.next 方法', function() {
        /**
         * 调用next 方法，程序会进入generator 函数內，直到遇到yield 语句，停止并退出generator 函数；
         * 再次调用next 方法，程序会再次进入generator 函数，并接着上次停止的地方继续执行；
         *
         * next 方法返回一个对象，该对象有两个属性：
         *  value 属性：可以是任何类型，是yield 语句或者return 语句的返回值；
         *  done 属性： 一个boolean 值，true 表示该generator 对象已经遍历结束；
         *
         * next 方法也可以接收一个参数，用于向generator 函数传入值；
         * */
        it('4-1) 返回一个有着value属性和done属性的对象', function() {
            function* foo() {
                yield 1;
            }

            let g = foo();
            expect(g.next()).toEqual({value: 1, done: false});

            // 遍历器结束
            expect(g.next()).toEqual({value: undefined, done: true});
        });

        it('4-2) 接收一个参数向generator 函数传值', function() {
            let i, j, k;

            function* foo() {
                i = yield 1;
                j = yield 2;
                k = yield 3;
            }

            let g = foo();

            // 进入foo，遇到yield 1语句，foo函数停止
            g.next('第一次调用next，generator 函数并不会获取到该参数');
            expect(i).toBe(undefined);
            expect(j).toBe(undefined);
            expect(k).toBe(undefined);

            // 再次进入foo，
            // 将next参数'to i' 作为yield 1语句的值，
            // 执行 i = yield 1;
            // 遇到yield 2, foo函数停止
            g.next('to i');
            expect(i).toBe('to i');
            expect(j).toBe(undefined);
            expect(k).toBe(undefined);

            // 再次进入foo，
            // 将next参数'to j' 作为yield 2语句的值，
            // 执行 j = yield 2;
            // 遇到yield 3, foo函数停止
            g.next('to j');
            expect(i).toBe('to i');
            expect(j).toBe('to j');
            expect(k).toBe(undefined);

            // 再次进入foo，
            // 将next参数'to k' 作为yield 3语句的值，
            // 执行 k = yield 3;
            // foo 函数执行结束；遍历结束
            let end = g.next('to k');
            expect(i).toBe('to i');
            expect(j).toBe('to j');
            expect(k).toBe('to k');
            expect(end).toEqual({value: undefined, done: true});
        })
    });

    describe('4-3) Generator.prototype.return 方法', function() {
        /**
         * gen.return (value)
         * 该方法会返回给定的值，并结束generator 对象的遍历；
         * */
        it('4-4) 返回给定的值，并结束generator 对象的遍历', function() {
            function* foo() {
                yield 1;
                yield 2;
                yield 3;
            }

            let g = foo();
            let result = g.return('biu~~~');
            expect(result.value).toBe('biu~~~');
            expect(result.done).toBe(true);

            //继续调用next方法也不会执行yield 语句了。。。
            result = g.next();
            expect(result).toEqual({value: undefined, done: true});
        });

        it('4-5) generator 对象遍历结束后，还可以调用return 方法', function() {
            function* foo() {
                yield 1;
                yield 2;
            }

            let g = foo();
            g.next(); // {value: 1,done: false}
            g.next(); // {value: 2,done: false}
            g.next(); // {value: undefined, done: true}

            let result = g.return('XmX');
            expect(result).toEqual({value: 'XmX', done: true});
        });

        it('4-6) generator 函数内部的return 语句也可以返回一个值，并结束遍历', function() {
            function* foo() {
                yield 1;
                return '我return 啦';
                yield '不会在执行,m_m...';
            }

            let g,
                result;
            g = foo();

            result = g.next();
            expect(result).toEqual({value: 1, done: false});

            //遇到了return 语句，遍历状态就改变了；
            result = g.next();
            expect(result).toEqual({value: '我return 啦', done: true});

            result = g.next();
            expect(result).toEqual({value: undefined, done: true});
        });
    });

    describe('5) Generator.prototype.throw 方法', function() {
        /**
         * throw 方法通过向generator 函数內抛出一个错误，来恢复generator 函数的执行，
         * 返回一个包含done属性和value属性的对象；
         * gen.throw(exception)
         *
         * 参数：
         *  exception: 将要抛出的异常；处于调试目的，该参数如果是一个Error类型值，将会很有用；
         *
         * 返回：
         *  一个对象，有以下两个属性：
         *  done： 一个boolean 值，true 表示generator 对象遍历结束；
         *  value：任何javascript 数值类型，是yield 语句或return 语句的返回值；
         * */
        it('5-1) 可以在generator 函数内部被捕获',function() {
            function* foo(){
                try{
                    yield 1;
                }catch(e){
                    yield 2;
                }
                yield 3;
            }

            let g,
                result;
            g = foo();
            result = g.next();
            expect(result).toEqual({value: 1,done: false});

            result = g.throw(new Error('oop...'));
            expect(result).toEqual({value: 2, done: false});
        });

        it('5-2) 如果generator 函数内部并没有捕获代码，那么异常将会抛出到generator 函数外部',function() {
            function* foo(){
                yield 1;
                yield 2;
            }
            let g = foo();

            g.next();
            expect(function() {
                g.throw(new Error('oop...'));
            }).toThrow();
        });
    });



    describe('6) generator 函数使用场景',function() {
        it('6-1) 作为对象属性的generator 函数',function() {
            let obj = {
                * foo(){}
            };
            let g = obj.foo();
            expect(Object.prototype.toString.call(g)).toBe('[object Generator]');

            // 或者
            let obj2 = {
                foo: function* (){}
            };
            let g2 = obj2.foo();
            expect(Object.prototype.toString.call(g2)).toBe('[object Generator]');
        });

        it('6-2) 部署Symbol.iterator 接口',function() {
            /**
             * 因为generator 函数会返回一个遍历器对象，所以可以用来实现Symbol.iterator 属性接口
             * */
            let obj = {
                name: 'qy',
                age: 11
            };
            obj[Symbol.iterator] = function* (){
                yield 'start';
                yield this.name;
                yield this.age;
                yield 'end'
            };
            // 现在可以用for...of 来遍历obj 对象了
            let result = [];
            for(let item of obj){
                result.push(item);
            }
            expect(result).toEqual(['start','qy',11, 'end']);
        });

        it('6-3) 可以实现状态机',function() {
            // es5的实现
            let task1 = function(){};
            let task2 = function(){};
            let status = false;
            let toggle = function(){
                if(status){
                    task1();
                }else{
                    task2();
                }
                status = !status;
            };
            toggle(); // run task1;
            toggle(); // run task2;
            toggle(); // run task1;
            // ...

            // generator 的实现
            let foo = function* (){
                while(true){
                    task1();
                    yield;
                    task2();
                    yield;
                }
            };
            let toggle2 = foo();
            toggle2.next(); // run task1;
            toggle2.next(); // run task2;
            toggle2.next(); // run task1;
            // ...
        });

        it('6-4) 控制一组同步任务的执行顺序',function() {
            // 集中定义了一组相关的任务；
            let Gen = function* (){
                let task1 = jasmine.createSpy();
                let task2 = jasmine.createSpy();
                let task3 = jasmine.createSpy();
                let tasks = [task1,task2,task3];

                for(let i=0,l=tasks.length;i<l;i++){
                    yield tasks[i];
                }
            };
            let g = Gen();

            // 在任意场景中按需执行；
            // do something
            // ...
            g.next();
            // do another thing
            // ...
            g.next();
            // end
            // ...
            g.next();


        });
    });

});