let readFile = require('../lib/readFile.js');

describe('Day 17: async function',function(){
    /**
     * async function 函数申明会创建一个异步函数，该函数会返回一个Promise对象；
     * */

    describe('1) 直观认识',function(){
        it('1-1) 是Generator 函数的语法糖',function(done) {
            // async function 与generator 函数比较
            // 实例：读取两个文件操作

            // generator 函数版本
            let genFunction = function* (){
                let f1 = yield readFile('./file1');
                let f2 = yield readFile('./file2');
                return [f1,f2];
            };
            let gen = genFunction();

            // 通过thunk函数或者co模块可以自动执行gen 对象，
            // 这里我们手动执行gen 对象；
            let file1 = gen.next().value;
            file1.then(
                function onResolve(data){
                    let file2 = gen.next(data).value;
                    file2.then(
                        function onResolve(data){
                            let result = gen.next(data);
                            expect(result.value).toEqual(['./file1 data','./file2 data']);
                            // gen对象遍历结束；
                            expect(result.done).toBe(true);
                        }
                    );
                }
            );

            // async function 版本
            let asyncReadFile = async function(){
                let f1 = await readFile('./file1');
                let f2 = await readFile('./file2');
                return [f1,f2];
            };
            // 不需要手动编写执行器
            asyncReadFile().then(
                function onResolve(data){
                    expect(data).toEqual(['./file1 data','./file2 data']);
                }
            );
            /**
             * 当一个async function 执行后，它会立即返回一个Promise对象；
             * 再执行async function內的异步语句，当执行到return 语句时，return 的值将会作为Promise 对象resolve（完成状态）时的值；
             * 当async function内部抛出异常时，Promise 对象会变成reject（失败）状态；
             *
             * async function 内部可以出现await 语句；
             * await 语句会暂停async function 的执行，等待await 语句后面的异步表达式完成，然后恢复async function的执行；
             *
             * */
            setTimeout(done,0);

        });
    });

    describe('2) 与 generator 函数比较',function(){
        it('2-1) async function 内置自动执行器，不需要我们手动执行、或自己实现执行器',function(done) {
            // 实例：读取两个文件操作
            let asyncReadFile = async function(){
                let f1 = await readFile('./file1');
                let f2 = await readFile('./file2');
                return [f1,f2];
            };
            // 不需要手动编写执行器
            asyncReadFile().then(
                function onResolve(data){
                    expect(data).toEqual(['./file1 data','./file2 data']);
                    done();
                }
            );
        });

        it('2-2) 更好的语义',function() {
            let fileData = Promise.resolve('data');

            let genFunction = function* (){
                let file = yield fileData;
            };

            let asyncFunction = async function(){
                let file = await fileData;
            };
            /**
             * 关键词'async' 比 '*' 更明确；
             * 关键词'await' 比 'yield'更语义化
             * */
        });

        it('2-3) 返回值是Promise对象，而generator 函数返回值是一个遍历器对象',function(done) {
            /**
             * async function 可以通过返回的Promise 对象的then方法来指定获得最后结果时的操作；
             * generator function 只是返回一个遍历器对象，如果要获取最后的执行结果，必须手动遍历generator对象或者使用自动执行器；
             * */
                // 该实例与 '直观认识：是Generator 函数的语法糖' 相同
                // 实例：读取两个文件操作

                // generator 函数版本
            let genFunction = function* (){
                    let f1 = yield readFile('./file1');
                    let f2 = yield readFile('./file2');
                    return [f1,f2];
                };
            let gen = genFunction();

            // 这里我们手动执行gen 对象；
            let file1 = gen.next().value;
            file1.then(
                function onResolve(data){
                    let file2 = gen.next(data).value;
                    file2.then(
                        function onResolve(data){
                            let result = gen.next(data);
                            expect(result.value).toEqual(['./file1 data','./file2 data']);
                            // gen对象遍历结束；
                            expect(result.done).toBe(true);
                        }
                    );
                }
            );

            // async function 版本
            let asyncReadFile = async function(){
                let f1 = await readFile('./file1');
                let f2 = await readFile('./file2');
                return [f1,f2];
            };
            // 不需要手动编写执行器
            asyncReadFile().then(
                function onResolve(data){
                    expect(data).toEqual(['./file1 data','./file2 data']);
                    done();
                }
            );
        });
    });

    describe('3) 基本用法',function() {
        it('3-1) async function 会返回一个promise对象',function() {
            let asyncFn = async function(){};
            let result = asyncFn();
            expect(Object.prototype.toString.call(result)).toBe('[object Promise]');
        });

        it('3-2) async function 內部，return语句后面的值将作为promise对象resolve时的值',function(done) {
            let asyncFn = async function(){
                return 1;
            };
            let promise = asyncFn();
            promise.then(
                function onResolve(data){
                    expect(data).toBe(1);
                    done();
                }
            );
        });
    });
    describe('4) async function 内部的await 语句',function() {
        it('4-1) 只能用于async 函数内部,否则会出现语法错误',function() {});

        it('4-2) 会中止async function 的执行，等待一个promise对象变成resolve状态',function(done) {
            let seq = [];
            let asyncFn = async function(){
                seq.push('1: in asyncFn');
                await Promise.resolve(1);
                seq.push('2: in asyncFn');
            };
            asyncFn().then(
                function onResolve(data){}
            );
            seq.push('3: out');

            setTimeout(function(){
                expect(seq).toEqual([
                    '1: in asyncFn',
                    '3: out',
                    '2: in asyncFn'
                ]);
                done();
            },0);
        });

        it('4-3) await 语句的值是promise对象resolve后的值',function(done) {
            let result;
            let asyncFn = async function () {
                result = await Promise.resolve(1);
                expect(result).toBe(1);
                result = await Promise.resolve(2);
                expect(result).toBe(2);
                result = (await Promise.resolve(3)) + (await Promise.resolve(4));
                expect(result).toBe(7);
                done();
            };
            asyncFn();
        });

        it('4-4) await 语句后如果不是一个promise 对象，那么await 会把它转化为promise 对象，并等待它完成',function(done) {
            let result;
            let asyncFn = async function () {
                result = await 1;
                expect(result).toBe(1);
                done();
            };
            asyncFn();
        });

        it('4-5) 如果await 语句后面的promise 对象是reject（失败）状态，那么reject 的值将会被抛出',function(done) {
            let tag;
            let asyncFn =async function(){
                try{
                    tag = 1;
                    await Promise.reject('fail');
                }catch(e){
                    tag = e;
                }
            };
            asyncFn();
            setTimeout(function() {
                expect(tag).toBe('fail');
                done();
            },0);
        })

        it('4-6) async function 内部执行顺序',function(done) {
            let seq = [];
            let asyncFn = async function () {
                seq.push('0: in asyncFn');
                let data = await readFile('./file1');
                seq.push('1: in asyncFn');
                return data;
            };

            seq.push('2: start');
            asyncFn().then(
                function onResolve(data){
                    seq.push('3: get result: ' + data);
                }
            );

            seq.push('4: after call async fn');

            setTimeout(function() {
                expect(seq).toEqual([
                    '2: start',
                    '0: in asyncFn',
                    '4: after call async fn',
                    '1: in asyncFn',
                    '3: get result: ./file1 data'
                ]);
                done();
            },0);
        });
    });

    describe('5) 可以将async 函数看作是generator 函数和自动执行器包装在一起',function(){
        /**
         * async function fn(){}
         * 等同于：
         function fn(){
                return spawn(function* (){});
            }
         * */
        it('5-1) 包裹器spawn的实现方式' ,function(done) {
            function spawn(genFunction){
                return new Promise(function(resolve,reject){
                    let gen = genFunction();

                    // generator 执行器；
                    function runGenerator(next){
                        let result;
                        try{
                            // result 是遍历器next方法的返回值，是一个有着value 和 done属性的对象；
                            result = next();
                        }catch(e){
                            return reject(e);
                        }

                        // 判断generator对象的遍历是否结束
                        if(result.done){
                            return resolve(result.value);
                        }

                        Promise.resolve(result.value).then(
                            function onResolve(data){
                                runGenerator(function(){return gen.next(data);});
                            },
                            function onReject(reason){
                                runGenerator(function(){return gen.throw(reason);});
                            }
                        );
                    }
                    runGenerator(function(){return gen.next();});
                });
            }

            // 用法
            let generatorFn = function* (){
                let f1 = yield Promise.resolve(1);
                let f2 = yield Promise.resolve(2);
                return [f1,f2];
            };
            let myAsyncFunction = function(){
                return spawn(generatorFn);
            };
            myAsyncFunction().then(
                function onResolve(data){
                    expect(data).toEqual([1,2]);
                }
            );

            setTimeout(function() {
                done();
            },0);
        });
    });
});