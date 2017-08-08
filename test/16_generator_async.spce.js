let thunkify = require('thunkify');
let co = require('co');

describe('Day 16: Generator 函数的异步应用',function(){
    /**
     * thunk 函数是自动执行generator 函数的一种方法；
     * */
    describe('1) thunk 函数',function() {
        it('1-1) 参数的求值策略：1.传值调用; 2.传名调用;',function() {
            // 实例：
            function foo(m){
                return m*2;
            }
            let x = 1;
            foo(x+5);

            // 问题： foo调用时的参数应该在何时求值？

            // 1. 传值调用: 先求参数表达式的值，再调用foo函数
            // foo(x+5) 等价于 foo(6) => 6*2

            // 2. 传名调用: 先调用foo函数，在用到参数表达式时在求值
            // foo(x+5) 等价于 foo(x+5) => (x+5)*2

            // '2.传名调用' 的一个好处是，某些情况下可以避免性能损失：
            function foo2 (a,b){
                if(true){
                    return a;
                }else{
                    return b;
                }
            }
            foo2(1,3*x*x+2*x-1);
            // 会发现foo2 的第二个参数表达式比较复杂，而在foo2函数內，该参数并没有用到，
            // '传值调用' 会计算第二个参数表达式的值，
            // 而'传名调用'并不会计算第二个参数表达式的值，
        });

        it('1-2) 通过thunk函数实现"传名调用"',function() {
            /**
             *  "传名调用"的实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体。
             *  这个临时函数就叫做 Thunk 函数。
             * */
            function foo(m){
                return m*2;
            }
            let x = 1;
            foo(x+5);

            // 改写foo函数
            function foo2(thunk){
                return thunk()*2;
            }
            let trunk = function(){
                return x+5;
            };
            foo2(trunk);
            // 这样就将foo2 函数改为"传名调用"了，只有在用到参数的地方，才会求该参数表达式的值；
        });

        it('1-3) JavaScript 中的thunk 函数',function() {
            /**
             * 在JavaScript 中，thunk 函数并不是用来替换参数表达式的，
             * 而是用来替换多参数函数的,将其替换成一个只接受回调函数作为参数的单参数函数。
             * */
                // 实例：
            let result;
            function foo(a,callback){
                return callback(a);
            }
            function callbackFn(x){
                return x+1;
            }
            result = foo(1,callbackFn);
            expect(result).toBe(2);

            // 将foo 改写为只接收一个参数的thunk 函数
            function makeFooTobeThunk (a) {
                return function(callback){
                    return foo(a,callback);
                };
            }
            let fooThunk = makeFooTobeThunk(1);
            result = fooThunk(callbackFn);
            expect(result).toBe(2);

            // 调用fooThunk 函数与调用foo 函数的效果是一样的，
            // 只是foo 函数接收两个参数，
            // 而fooThunk 函数只接收一个参数： 回调函数；
        });

        it('1-4) thunk 函数转换器',function() {
            /**
             * 多参数函数经过转换器处理，它将变成一个接受单参数函数，只接受回调函数作为参数。
             * */
            function foo(a,b,callback){
                return callback(a,b);
            }
            function add(a,b){
                return a+b;
            }
            let fooThunk,result;
            // ES5 版本
            var ThunkES5 = function(fn) {
                return function(){
                    var self = this;
                    var args = Array.prototype.slice.call(arguments);
                    return function thunk(callback){
                        args.push(callback);
                        return fn.apply(self,args);
                    }
                }
            };
            fooThunk = ThunkES5(foo)(1,2);
            result = fooThunk(add);
            expect(result).toBe(3);
            // 与直接调用foo函数结果相同；
            result = foo(1,2,add);
            expect(result).toBe(3);

            // ES2015 版本
            let ThunkES6 = function(fn){
                return function(...args){
                    let self = this;
                    return function thunk(callback){
                        return fn.call(self,...args,callback);
                    }
                }
            };
            fooThunk = ThunkES6(foo)(1,2);
            result = fooThunk(add);
            expect(result).toBe(3);
        });

        it('1-5) thunkify 模块',function() {
            /**
             * 生产环境的转换器，建议使用 thunkify 模块。
             * */
                // 使用实例
            let foo = function (a, callback) {
                    return callback(a);
                };
            let result;
            let add = function (x){ result= x+1;};

            let newFoo = thunkify(foo);
            let fooThunk = newFoo(1);

            // fooThunk只接受一个回调函数作为参数；
            fooThunk(add);
            expect(result).toBe(2);
        });

        it('1-6) thunkify 模块源码',function() {
            // thunkify 源码与上一节的简单转换器很像；
            function thunkify (fn){
                if('function' !== typeof fn){
                    throw new Error('function required');
                }

                return function(){
                    var args = new Array(arguments.length);
                    var ctx = this;

                    for(var i = 0; i < args.length; ++i) {
                        args[i] = arguments[i];
                    }

                    return function(done){
                        var called;
                        /**
                         * 一个thunk，多次执行后，args数组中会存在多个回调函数；
                         * 为了只执行新的回调函数，这里做了called变量的检测；
                         * */
                        args.push(function(){
                            if (called) return;
                            called = true;
                            done.apply(null, arguments);
                        });

                        try {
                            fn.apply(ctx, args);
                        } catch (err) {
                            done(err);
                        }
                    }
                }
            }
            // args 数组中会存在多个callback 函数,line： 173所示；
            let result;
            function foo(a,callback){
                result = arguments;
                callback(a);
            }
            let newFoo = thunkify(foo);
            let thunk = newFoo(1);
            let callback = function(x){return x;};
            thunk(callback);
            expect(result.length).toBe(2);

            thunk(callback);
            expect(result.length).toBe(3);

            thunk(callback);
            expect(result.length).toBe(4);

            // 哈哈 ...
            // 哈...
            // .

            // 但正常情况下是不这么用的，
            // 下面这种情况就不会有这样的怪异行为；
            let thunk1 = newFoo(1);
            let thunk2 = newFoo(2);
            thunk1(callback);
            expect(result.length).toBe(2);

            thunk2(callback);
            expect(result.length).toBe(2);
        });
    });

    describe('2) 通过thunk 函数实现generator 函数异步流程管理',function() {
        it('2-1) 简单实例',function(done){
            // 模拟读取文件异步操作操作
            function readFile(filename,callback){
                let fileData = filename + ' data';
                let error = null;
                setTimeout(function(){
                    callback(error,fileData);
                },0);
            }

            let newReadFile,
                thunk,
                fileDataArray = [];

            newReadFile = thunkify(readFile);

            // 0 读取文件实例：
            thunk = newReadFile('./file0');
            // readFileThunk 函数只接受一个回调函数作为参数
            thunk(function(error,data){
                fileDataArray.push(data);
                expect(data).toBe('./file0 data');
            });
            // 0_1 以上操作等价于：
            // readFile('./file0',function(error,data){
            //     fileDataArray.push(data);
            //     expect(data).toBe('./file0 data');
            // });

            // 1 generator 操作实例：
            // 1_1 定义一组读取文件的操作；
            function* generatorFn(){
                let data;
                data = yield newReadFile('./file1');
                fileDataArray.push(data);

                data = yield newReadFile('./file2');
                fileDataArray.push(data);
            }
            let gen = generatorFn();
            let result;

            // 1_2 开始执行流程
            result = gen.next();
            thunk = result.value;
            thunk(function callback(error,data){
                result = gen.next(data);
                expect(data).toBe('./file1 data');

                thunk = result.value;
                thunk(function callback(error,data){
                    gen.next(data);
                    expect(data).toBe('./file2 data');
                    // gen 遍历结束；
                    expect(fileDataArray).toEqual(['./file0 data','./file1 data','./file2 data']);

                    // 结束测试用例
                    done();
                });
            });
        });

        it('2-2) 进阶：自动流程管理',function(done) {
            // 模拟读取文件异步操作操作
            function readFile(filename,callback){
                let fileData = filename + ' data';
                let error = null;
                setTimeout(function(){
                    callback(error,fileData);
                },0);
            }

            // 一个基于thunk 的generator 执行器；
            function runGen(generatorFn){
                let gen = generatorFn();
                let callback = function(error,data){
                    let result = gen.next(data);
                    if(result.done){
                        return;
                    }
                    let thunk = result.value;
                    thunk(callback);
                };
                callback();
            }

            // 再次来实现文件读取操作
            let fileDataArray = [];
            let newReadFile = thunkify(readFile);
            function* generatorFn(){
                let f1 = yield newReadFile('./file0');
                fileDataArray.push(f1);

                let f2 = yield newReadFile('./file1');
                fileDataArray.push(f2);

                let f3 = yield newReadFile('./file2');
                fileDataArray.push(f3);
            }

            runGen(generatorFn);

            setTimeout(function() {
                expect(fileDataArray).toEqual(['./file0 data','./file1 data','./file2 data']);
                done();
            },10);
        });
    });

    describe('3) co 模块',function() {
        /**
         * co 模块是一个用于自动执行generator 函数的执行器；
         * */

        it('3-1) 实例：读取两个文件',function(done) {
            // 模拟读取文件异步操作操作
            function readFile(filename,callback){
                let fileData = filename + ' data';
                let error = null;
                setTimeout(function(){
                    callback(error,fileData);
                },0);
            }

            let newReadFile = thunkify(readFile);
            let fileDataArray = [];
            function* generatorFn(){
                let f1 = yield newReadFile('./file0');
                fileDataArray.push(f1);

                let f2 = yield newReadFile('./file1');
                fileDataArray.push(f2);
            }

            co(generatorFn).then(function() {
                expect(fileDataArray).toEqual(['./file0 data','./file1 data']);
                done();
            });
        });

        /**
         *  co 模块既支持thunk 函数，也支持promise 对象，
         *  也就是说yield 语句后面可以是thunk 函数，也可以是promise对象；
         *  上一节已经介绍了基于thunk 函数的执行器，下面介绍基于promise 对象的执行器；
         * */
        it('3-2) 基于promise 的执行器',function(done) {
            // 模拟文件读取操作，promise 形式；
            function readFile(filename,callback){
                return new Promise(function(resolve,reject){
                    // 模拟异步读取操作
                    setTimeout(function() {
                        let data = filename + ' data';
                        resolve(data);
                    },0);
                });
            }

            let fileDataArray = [];

            function* generatorFn(){
                let f1 = yield readFile('./file0');
                fileDataArray.push(f1);

                let f2 = yield readFile('./file1');
                fileDataArray.push(f2);
            }

            // 手动执行
            let gen = generatorFn();
            let result = gen.next();
            result.value.then(
                function onResolve(data){
                    result = gen.next(data);
                    result.value.then(
                        function onResolve(data){
                            result = gen.next(data);
                            // generator 函数遍历结束
                            expect(result.done).toBe(true);
                        }
                    );
                }
            );

            setTimeout(function() {
                expect(fileDataArray).toEqual(['./file0 data','./file1 data']);
                done();
            },10);
        });

        describe('3-3) co 模块的源码',function() {
            /**
             * 面那个基于promise 的执行器是co 模块的一个精简版，
             * 下面我们来看点严肃的：来逐步还原一个co 模块
             * */
            it('3-3-1) 会返回一个promise 对象',function() {
                function co(){
                    return new Promise(function(resolve,reject){});
                }

                let result = co();
                expect(Object.prototype.toString.call(result)).toBe('[object Promise]');
            });

            it('3-3-2) 会接受一个generator 函数作为参数',function(done){
                function co(gen){
                    return new Promise(function(resolve,reject){
                        if(typeof gen === 'function'){
                            gen = gen();
                        }
                        if(!gen || typeof gen.next !== 'function'){
                            // 如果不是generator 函数，那么直接将执行结果返回出去；
                            return resolve(gen);
                        }
                        // 如果传入的是generator 函数，那么我们将继续处理；
                        return resolve('继续处理');
                    });
                }
                let foo1 = function(){return 'not generator function';};
                let foo2 = function* (){};
                co(foo1).then(
                    function onResolve(data){
                        expect(data).toBe('not generator function');
                    }
                );

                co(foo2).then(
                    function onResolve(data){
                        expect(data).toBe('继续处理');
                        done();
                    }
                );

            });

            it('3-3-3) 手动遍历generator 对象',function(done) {
                /**
                 * 假设generator 函数只有两条yield 语句，手动遍历该generator 对象
                 * */
                function co(gen){
                    return new Promise(function(resolve,reject){
                        if(typeof gen === 'function'){
                            gen = gen();
                        }
                        if(!gen || typeof gen.next !== 'function'){
                            // 如果不是generator 函数，那么直接将执行结果返回出去；
                            return resolve(gen);
                        }
                        // 如果传入的是generator 函数，那么我们将继续处理；
                        let result = gen.next();
                        result.value.then(
                            function onResolve(data){
                                result = gen.next(data);
                                result.value.then(
                                    function onResolve(data){
                                        result = gen.next(data);
                                        resolve(result.value);
                                        // 遍历结束；
                                    }
                                );
                            }
                        );

                    });
                }
                let content1,content2;
                function* foo(){
                    content1 = yield Promise.resolve('step1');
                    content2 = yield Promise.resolve('step2');
                }
                co(foo).then(
                    function onResolve(data){
                        expect(data).toBe(undefined);
                        expect(content1).toBe('step1');
                        expect(content2).toBe('step2');
                        done();
                    }
                );
            });

            it('3-3-4) 将generator 对象的遍历操作封装成executeNext 函数',function() {
                function co(gen){
                    return new Promise(function(resolve,reject){
                        if(typeof gen === 'function'){
                            gen = gen();
                        }
                        if(!gen || typeof gen.next !== 'function'){
                            // 如果不是generator 函数，那么直接将执行结果返回出去；
                            return resolve(gen);
                        }
                        // 如果传入的是generator 函数，那么我们将继续处理；
                        executeNext();

                        function executeNext(){
                            let result;
                            result = gen.next();
                            result.value.then(
                                function onResolve(data){
                                    // 从这个地方开始，代码开始重复了；
                                    result = gen.next(data);
                                    result.value.then(
                                        function onResolve(data){
                                            result = gen.next(data);
                                            resolve(result.value);
                                            // 遍历结束；
                                        }
                                    );
                                }
                            );
                        }

                        // 来看下 executeNext的第二版，
                        // 递归解决重复代码
                        // 用法： 直接调用: executeNext_version_2();
                        function executeNext_version_2 (data){
                            let result;
                            result = gen.next(data);
                            result.value.then(
                                function onResolve(data){
                                    // 从这个地方开始，代码开始重复了；
                                    executeNext_version_2(data);
                                }
                            );
                        }
                        // executeNext的第三版：加入递归停止条件、容错处理
                        function executeNext_version_3(data){
                            let result;
                            result = gen.next(data);
                            // 加入递归停止条件
                            if(result.done){
                                // generator 对象遍历结束
                                return resolve(result.value);
                            }
                            // 对thunk 函数的处理
                            // 这里做了简化处理，对result为其他类型值并未处理；
                            if(typeof result === 'function'){
                                result = thunkToPromise(result);
                            }
                            if(result && result.value && result.value.then){
                                return result.value.then(
                                    function onResolve(data){
                                        // 从这个地方开始，代码开始重复了；
                                        executeNext_version_3(data);
                                    }
                                );
                            }
                        }
                        function thunkToPromise(fn) {
                            var ctx = this;
                            return new Promise(function (resolve, reject) {
                                fn.call(ctx, function (err, res) {
                                    if (err) return reject(err);
                                    if (arguments.length > 2) res = slice.call(arguments, 1);
                                    resolve(res);
                                });
                            });
                        }

                        // executeNext的第四版： 加入错误捕获处理
                        function executeNext_version_4(data){
                            let result;
                            // 错误捕获处理
                            try{
                                result = gen.next(data);
                            }catch(e){
                                return reject(e);
                            }

                            // 加入递归停止条件
                            if(result.done){
                                // generator 对象遍历结束
                                return resolve(result.value);
                            }
                            // 对thunk 函数的处理
                            // 这里做了简化处理，对result为其他类型值并未处理；
                            if(typeof result === 'function'){
                                result = thunkToPromise(result);
                            }
                            if(result && result.value && result.value.then){
                                return result.value.then(
                                    function onResolve(data){
                                        // 从这个地方开始，代码开始重复了；
                                        executeNext_version_4(data);
                                    }
                                );
                            }
                            // yield 语句后跟的不是thunk函数、也不是promise 对象；
                            return reject(new TypeError('just Thunk function or Promise object can be yielded!'));
                        }
                    });
                }
            });

            it('3-3-5) 最终版（并不是完整版）',function(done){
                function co(gen){
                    return new Promise(function(resolve,reject){
                        if(typeof gen === 'function'){
                            gen = gen();
                        }
                        if(!gen || typeof gen.next !== 'function'){
                            // 如果不是generator 函数，那么直接将执行结果返回出去；
                            return resolve(gen);
                        }

                        // 如果传入的是generator 函数，那么我们将继续处理；
                        executeNext();

                        function executeNext(data){
                            let result;
                            // 错误捕获处理
                            try{
                                result = gen.next(data);
                            }catch(e){
                                return reject(e);
                            }

                            next(result);
                        }

                        function next(result){
                            // 加入递归停止条件
                            if(result.done){
                                // generator 对象遍历结束
                                return resolve(result.value);
                            }
                            // 对thunk 函数的处理
                            // 这里做了简化处理，对result为其他类型值并未处理；
                            if(typeof result === 'function'){
                                result = thunkToPromise(result);
                            }
                            if(result && result.value && result.value.then){
                                return result.value.then(
                                    function onResolve(data){
                                        // 从这个地方开始，代码开始重复了；
                                        executeNext(data);
                                    }
                                );
                            }
                            // yield 语句后跟的不是thunk函数、也不是promise 对象；
                            return reject(new TypeError('just Thunk function or Promise object can be yielded!'));

                        }

                    });
                }

                let result1,result2,result3;
                function* generatorFn(){
                    result1 = yield Promise.resolve('step1');
                    result2 = yield Promise.resolve('step2');
                    result3 = yield Promise.resolve('step3');
                }
                co(generatorFn).then(function() {
                    expect(result1).toBe('step1');
                    expect(result2).toBe('step2');
                    expect(result3).toBe('step3');
                    done();
                });



                function thunkToPromise(fn) {
                    var ctx = this;
                    return new Promise(function (resolve, reject) {
                        fn.call(ctx, function (err, res) {
                            if (err) return reject(err);
                            if (arguments.length > 2) res = slice.call(arguments, 1);
                            resolve(res);
                        });
                    });
                }
            });
        });

        it('3-4) 处理并发的异步操作',function(done) {
            /**
             * co 支持并发的异步操作，即允许某些操作同时进行，等到它们全部完成，才进行下一步。
             * 这时，要把并发的操作都放在数组或对象里面，跟在yield语句后面。
             *
             * 注： 上一节自己实现的co 模块是不支持该功能的，考虑到代码的简洁性，在演示中省略了相关部分代码；
             * */
                // 数组写法
            let result;
            co(function* (){
                result = yield [Promise.resolve(1),Promise.resolve(2)];
            }).then(
                function onResolve(){
                    expect(result).toEqual([1,2]);
                }
            );

            // 对象的写法
            co(function* () {
                result = yield {
                    a: Promise.resolve(1),
                    b: Promise.resolve(2)
                };
            }).then(
                function onResolve(){
                    expect(result).toEqual({a: 1, b: 2});
                    done();
                }
            );
        });
    });
});