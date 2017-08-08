describe('Day 13: Promise',function() {
    /**
     * Promise 对象表示一个异步操作的最终完成（或失败）情况;
     * 是异步编程的一种解决方案，比传统的回调函数解决方案更合理和更强大
     * */
    describe('1) 基本操作',function() {
        /**
         * 创建一个Promise对象
         *
         * new Promise(
         *     //executor
         *     function (resolve,reject){}
         * )
         * 参数：
         *  executor： 是一个函数，该函数带有resolve和reject两个参数,
         *            用于在未来某个时刻修改Promise的状态为fulfilled（完成）或者rejected（失败）；
         *
         * 描述：
         *  Promise对象的三种状态：
         *   1. pending: 初始状态，不是成功或失败状态;
         *   2. fulfilled: 意味着操作成功完成。
         *   3. rejected: 意味着操作失败。
         * */
        it('1-1) Promise构造器',function(done) {
            //demo1;
            let promise = new Promise(
                function executor(resolve,reject){
                    //模拟异步环境：在100ms后将要执行的业务逻辑
                    setTimeout(function(){
                        resolve({value: 'hi'});
                    },100);
                }
            );
            promise.then(
                //Promise对象的状态变为fulfilled时的回调函数
                function onResolve(data){
                    //do something with data;
                    //...
                    expect(data).toEqual({value: 'hi'});
                    done();
                },

                //Promise对象的状态变为rejected时的回调函数
                function onReject(reason){
                    console.log(reason.error);
                }
            );
            /**
             * 可能有疑问的是：
             * 如果我们在1000ms后再执行promise.then方法，定义成功时的操作onResolve函数，
             * 但executor函数中的resolve方法在100ms时就早已执行了，
             * 这样真的不会出问题吗，onResolve函数还会被执行吗？
             * 下面将会讲到Promise的一些执行顺序问题；
             *
             * */
        });

        it('1-2) executor参数会在Promise构造函数执行时同步执行',function() {
            //用于保存执行顺序
            let arr = [];
            arr.push('0) start');
            let p = new Promise(
                    function executor(resolve,reject){
                        arr.push('1) executor Fn called');
                    }
                );
            arr.push('2) end');

            expect(arr.join(' -> ')).toBe('' +
                '0) start -> ' +
                '1) executor Fn called -> ' +
                '2) end');
        });

        it('1-3) 执行顺序问题：常规',function(done){
            //用于保存执行顺序
            let arr = [];

            arr.push('0) start');
            let p = new Promise(
                function executor(resolve,reject){

                    arr.push('1) executor Fn called');

                    //模拟异步环境：在100ms后将要执行的业务逻辑
                    setTimeout(function(){

                        arr.push('2) ready to resolve');
                        resolve('hi');
                    },100);
                }
            );

            arr.push('3) end new and execute then Fn');
            p.then(
                function onResolve(data){

                    arr.push('4) in onResolve');
                    expect(data).toBe('hi');
                    expect(arr.join('->')).toBe(seq);
                    done();
                },
                function onReject(reason){}
            );

            arr.push('5) end');

            let seq = '' +
                '0) start->' +
                '1) executor Fn called->' +
                '3) end new and execute then Fn->' +
                '5) end->' +
                '2) ready to resolve->' +
                '4) in onResolve';
        });

        it('1-4) 执行顺序问题：延迟了then方法', function(done) {
            //用于保存执行顺序
            let Tag = [];

            Tag.push('0) start');
            let p = new Promise(
                function executor(resolve, reject) {

                    Tag.push('1) executor Fn called');

                    //模拟异步环境：在20ms后将要执行的业务逻辑
                    setTimeout(function() {

                        Tag.push('2) ready to resolve');
                        resolve('hi');
                    }, 20);
                }
            );

            Tag.push('3) end new');
            setTimeout(function(){

                Tag.push('3.5) then Fn called');

                p.then(
                    function onResolve(data) {

                        Tag.push('4) in onResolve');

                        expect(data).toBe('hi');
                        expect(Tag.join('->')).toBe(seq);
                        done();
                    },
                    function onReject(reason) {}
                );

                Tag.push('4.5) then Fn end');
            },50);

            Tag.push('5) end');

            let seq = '' +
                      '0) start->' +
                      '1) executor Fn called->' +
                      '3) end new->' +
                      '5) end->' +
                      '2) ready to resolve->' +
                      '3.5) then Fn called->' +
                      '4.5) then Fn end->' +
                      '4) in onResolve';

            /**
             * 正常情况下，then方法内部会等待executor方法中的resolve方法来完成异步操作(同时执行onReject方法)，
             * 但在该示例中，then方法执行的比较晚，此时executor方法中的resolve方法已经执行了，promise的状态已经变成了fulfilled状态，
             * 所以在之后执行then方法，并传入onResolve方法时，then方法判断promise的状态为完成状态后会立即在下个任务周期调用onResolve方法，
             * 效果类似 setTimeout(onResolve,0);
             *
             * */
        });

        it('1-5) 示例： 通过ajax发送get请求',function() {
            let ajax = {};
            //callback版本：
            ajax.get = function(url,onSuccess,onError){
                let client = new XMLHttpRequest();
                client.open('get',url);
                client.onreadystatechange = onChange;
                client.responseType = 'json';
                client.setRequestHeader('Accept','application/json');
                client.send();

                function onChange() {
                    if(this.readyState !== 4){
                        return ;
                    }
                    if(this.status === 200){
                        onSuccess(this.reponse);
                    }else{
                        onError(new Error(this.tatusText));
                    }
                }
            };
            //调用:
            /**
                ajax.get(
                       'http://localhost/api/...',
                       function onSuccess(data){console.log(data)},
                       function onError(reason){console.log(reason)}
                     );
             */

            //promise版本：
            ajax.promiseGet = function(url){
                let promise = new Promise(
                    function executor(resolve,reject){
                        let client = new XMLHttpRequest();
                        client.open('get',url);
                        client.onreadystatechange = onChange;
                        client.responseType = 'json';
                        client.setRequestHeader('Accept','application/json');
                        client.send();

                        function onChange() {
                            if(this.readyState !== 4){
                                return ;
                            }
                            if(this.status === 200){
                                // callback版本在该处是onSuccess函数 (line 194)；
                                resolve(this.reponse);
                            }else{
                                // callback版本在该处是onError函数 (line 196)；
                                reject(new Error(this.tatusText));
                            }
                        }
                    }
                );
                return promise;
            };
            //调用
            /**
                ajax.promiseGet('http://localhost/api...').then(
                                                                 function onSuccess(data){console.log(data)},
                                                                 function onError(reason){console.log(reason)}
                                                                );
             * */

        });

        it('1-6) 触发"reject"状态的情况',function(done){
            // 执行 reject
            let error = null;
            let p1 = new Promise(function(resolve,reject) {
                error = new Error('hi');
                reject(error);
            });
            p1.then(
                function onResolve(){},
                function onReject(reason){
                    expect(reason).toBe(error);
                }
            );

            //executor中出现异常
            let error2 = null;
            let p2 = new Promise(function(resolve,reject) {
                error2 = new Error('hi');
                throw error2;
            });
            p2.then(
                function onResolve(){},
                function onReject(reason){
                    expect(reason).toBe(error2);
                }
            );

            //resolve之前出现异常
            let error3 = null;
            let p3 = new Promise(function(resolve,reject){
                error3 = new Error('hi');
                throw error3;
                resolve('完成');
            });
            p3.then(
                function onResolve (data){
                    //  这里不会执行
                },
                function onReject(reason){
                    expect(reason).toBe(error3);
                }
            );

            // resolve之后出现异常
            let error4 = null;
            let p4 = new Promise(function(resolve,reject){
                resolve(1);
                error4 = new Error('hi');
                throw error4;
            });
            p4.then(
                function onResolve(data){
                    expect(data).toBe(1);
                    done();
                },
                function onReject(reason){
                    // 这里不会执行；
                }
            )
        });
    });

    describe('2) Promise.prototype上的属性和方法',function() {
        describe('2-1) Promise.prototype.then(onResolve,onReject)', function() {
            /**
             * 为 Promise 实例添加状态改变时的回调函数;
             *
             * 参数：
             *  onResolve： "完成（resolve）"状态的回调函数
             *  onReject： "失败（reject）"状态的回调函数
             * 返回：
             *  一个新的Promise实例，该promise的状态如下：
             *  1. "失败（reject）"状态：
             *   如果onResolve或者onReject抛出错误，then方法会返回一个新的"失败（reject）"状态的 promise；
             *   如果onResolve或者onReject返回一个"失败（reject）"状态的promise，then方法也会返回一个新的"失败（reject）"状态的 promise；
             *  2. "完成（resolve）"状态：
             *   如果onResolve或者onReject返回一个"成功（resolve）"状态的promise，then方法也会返回一个新的"完成（resolve）"状态的 promise；
             *   如果onResolve或者onReject返回一个任何其他值，then方法返回一个新的"完成（resolve）"状态的promise
             * */
            it('2-1-1) 将会返回一个新的promise', function(done) {
                let p = new Promise(function(resolve, reject) {
                    resolve(1);
                });
                let result = p.then(
                    function onResolve(data) {
                        return data + 2;
                    },
                    function onReject() {
                    }
                );
                expect(result.toString()).toBe('[object Promise]');

                // 链式调用
                result
                    .then(
                        function(data) {
                            return data + 3;
                        },
                        function() {
                        }
                    )
                    .then(
                        function(data) {
                            expect(data).toBe(1 + 2 + 3);
                            done();
                        },
                        function() {
                        }
                    );
            });

            it('2-1-2) 新promise 为"完成（resolve）"状态的情况', function(done) {
                // 1 onResolve 回调函数返回正常值
                let status1 = null;
                let p1 = new Promise(function(resolve, reject) {
                    resolve(1);
                });
                let result1 = p1.then(
                    function(data) {
                        return 2;
                    },
                    function() {
                    }
                );

                // 测试then方法返回promise的状态
                result1.then(
                    function(data) {
                        //此处会执行；
                        expect(data).toBe(2);
                        status1 = "完成";
                    },
                    function() {
                        //此处不会执行
                    }
                );

                // 2 onReject 回调函数返回正常值
                let status2 = null;
                let p2 = new Promise(
                    (resolve, reject) => {
                        reject(1)
                    }
                );
                let result2 = p2.then(
                    () => {
                    },
                    () => ({error: true})
                );

                // 测试then方法返回promise的状态
                result2.then(
                    data => {
                        expect(data).toEqual({error: true});
                        status2 = "完成";
                    },
                    () => {
                        //此处不会执行；
                    }
                );

                // 3 onResolve 返回一个完成状态的promise
                let status3 = null;
                let p3 = new Promise(
                    (resolve, reject) => {
                        resolve(1)
                    }
                );
                let anotherPromise3 = new Promise((resolve, reject) => {
                    resolve('another promise')
                });
                let result3 = p3.then(
                    () => anotherPromise3,
                    () => {
                    }
                );

                // 测试then方法返回promise的状态
                result3.then(
                    data => {
                        expect(data).toBe('another promise');
                        status3 = "完成";
                    },
                    () => {
                        //此处不会执行
                    }
                );

                setTimeout(() => {
                    expect(status1).toBe('完成');
                    expect(status2).toBe('完成');
                    expect(status3).toBe('完成');
                    expect(result3).not.toBe(anotherPromise3);
                    done();
                }, 0);
            });

            it('2-1-3) 新promise 为"失败（reject）"状态的情况', function(done) {
                // 1 onResolve 抛出错误
                let status1 = null;
                let p1 = new Promise(
                    (resolve, reject) => {
                        resolve(1);
                    }
                );
                let result1 = p1.then(
                    data => {
                        throw 'I\' have something wrong...';
                    },
                    () => {
                    }
                );
                // 测试then方法返回promise的状态
                result1.then(
                    () => {
                        //此处不会执行
                    },
                    reason => {
                        expect(reason).toBe('I\' have something wrong...');
                        status1 = "失败";
                    }
                );

                // 2 onResolve返回一个"失败（reject）"状态的promise
                let status2 = null;
                let p2 = new Promise(
                    (resolve, reject) => {
                        resolve(1);
                    }
                );
                let anotherPromiseWillReject = new Promise(
                    (resolve, reject) => {
                        reject('another promise is rejected');
                    }
                );
                let result2 = p2.then(
                    () => anotherPromiseWillReject,
                    () => {
                    }
                );
                // 测试then方法返回promise的状态
                result2.then(
                    () => {
                        //此处不会执行；
                    },
                    reason => {
                        expect(reason).toBe('another promise is rejected');
                        status2 = "失败";
                    }
                );

                setTimeout(() => {
                    expect(status1).toBe("失败");
                    expect(status2).toBe("失败");
                    expect(result2).not.toBe(anotherPromiseWillReject);
                    done();
                }, 0);
            });
        });

        describe('2-2) Promise.prototype.catch(onReject)', function() {
            /**
             * Promise.prototype.catch(onReject)方法是 promise.then(null,onReject)的别名，
             * 用于指定"失败（reject）"状态的下的回调函数；
             *
             * 参数：
             *  onReject： 当Promise被拒绝时的回调函数；
             * 返回：
             *  一个新的promise
             * */
            it("2-2-1) 捕获抛出的错误", function(done) {
                // 如果调用链上的then方法都不指定onReject回调函数，那么错误信息会往下传递，
                // 直到遇到catch方法或是指定了onReject的then方法才会被捕获；
                let status1 = null,
                    status2 = null,
                    status3 = null;
                let p1 = new Promise(
                    (resolve, reject) => {
                        resolve('success');
                    }
                );
                p1
                    .then(
                        () => {
                            status1 = '完成';
                            throw 'oop...';
                        },
                    )
                    .then(
                        () => {
                            //这里不会被执行；
                            status2 = 'resolve';
                        }
                    )
                    .catch(
                        (reason) => {
                            expect(reason).toBe('oop...');
                            expect(status1).toBe('完成');
                            expect(status2).toBe(null);
                        }
                    );


                // 调用链： catch之后还可以接then方法
                let p2 = new Promise(
                    (resolve, reject) => {
                        resolve('success');
                    }
                );
                p2
                    .then(
                        () => {
                            return new Promise((resolve, reject) => {
                                reject('rejected');
                            });
                        }
                    )
                    .catch(
                        (reason) => {
                            expect(reason).toBe('rejected');
                            return 'catch reject';
                        }
                    )
                    .then(
                        (data) => {
                            expect(data).toBe('catch reject');
                            done();
                        },
                        () => {
                        }
                    );
            });

            it('2-2-2) catch不会被执行的情况', function(done) {
                // 1 promise 始终为"完成状态";
                let result1 = null;
                let p1 = new Promise((resolve, reject) => {
                    resolve('resolve');
                });
                p1.catch(() => {
                    //此处不会执行；
                    result1 = 'fail';
                });
                setTimeout(() => {
                    expect(result1).toBe(null);
                }, 0);

                // 2 如果调用链中见某个then方法指定了onRject回调方法，那么该then会拦截在它之前的错误（reject），
                //   这样后面的catch方法就无法执行了
                let result2 = null;
                let p2 = new Promise((resolve, reject) => {
                    resolve(1);
                });
                p2
                    .then(
                        () => {
                            throw 'oop...';
                        },
                        () => {
                        }
                    )
                    .then(
                        () => {
                        },
                        (reason) => {
                            return 'get oop';
                        }
                    )
                    .catch(
                        () => {
                            result2 = 'fail';
                        }
                    );
                setTimeout(() => {
                    expect(result2).toBe(null);
                    done();
                }, 0);
            });

            it('2-2-3) 未捕获的错误', function(done) {
                // 如果未指定catch 方法，也未指定onReject回调方法，
                // promise內部抛出的错误将不会被捕获，该错误也不会传递到promise外部，脚本还是会正常运行；
                let status = null;
                let p = new Promise(
                    (resolve, reject) => {
                        throw 'unexpected error';
                    }
                );
                //脚本继续执行；
                p.then(
                    () => {
                        // 此处不会执行
                        status = '完成';
                    }
                );

                setTimeout(() => {
                    expect(status).toBe(null);
                    done();
                }, 0)


            });
        });
    });

    describe('3) Promise构造函数属性和方法',function() {
        describe('3-1) Promise.all(iterable)',function() {
            /**
             * 参数：
             *  iterable: 一个可遍历的对象，包含了多个promise对象；
             * 用法：
             *  Promise.all([promise1,promise2,...]);
             * 描述：
             *  该方法返回一个新的promise对象，该promise对象
             *  只有在iterable参数里所有的promise对象（即上面数组中的promise1，promise2...）都"完成"时，
             *  才会触发"完成"状态；
             * */
            it('3-1-1) Promise.all 等待所有代码的完成',function(done) {
                let start = new Date().getTime();
                let p1 = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve('p1 data');
                    }, 0);
                });
                let p2 = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        resolve('p2 data');
                    }, 20);
                });
                let iterable = [p1, p2];
                let newPromise = Promise.all(iterable);
                newPromise.then(
                    function onResolve(dataArray) {
                        let end = new Date().getTime() - start;
                        // dataArray是包含p1,p2完成时返回值的数组；
                        expect(dataArray).toEqual(['p1 data', 'p2 data']);

                        // newPromise转变成"完成"状态的时间由p1,p2中"完成"时间最长的一个决定
                        expect(end>=20).toBe(true);
                        done();
                    }
                );

                /**
                 * 该实例中，newPromise对象只有在p1,p2都"完成"时，才会成为"完成"状态，
                 * 而newPromise对象的onResolve函数会获得一个参数dataArray，
                 * */
            });
            it('3-1-2) iterable中只要有一个promise成为"失败"状态了，Promise.all返回的promise对象就会失败',function(done) {
                let start = new Date().getTime();
                let p1 = new Promise(function(resolve,reject){
                    setTimeout(function() {
                        reject('first error');
                    },10);
                });

                let p2 = new Promise(function(resolve,reject){
                    setTimeout(function() {
                        reject('second error');
                    },50);
                });
                Promise.all([p1,p2]).then(
                    function onResolve(){},
                    function onReject(reason){
                        let end = new Date().getTime() - start;

                        //第一个失败的promise的错误信息会作为新promise的错误信息
                        expect(reason).toBe('first error');
                        expect(end<50 && end>=10).toBe(true);
                        done();
                    }
                );

                /**
                 * 在p1成为失败后，Promise.all生成的promise对象也就成为"rejected（失败）"状态了；
                 * 错误信息为p1的错误信息，也就是第一个失败的promise的错误信息；
                 *
                 * */
            });
        });

        describe('3-2) Promise.race(iterable)',function() {
            /**
             * 方法返回一个新的 promise，参数iterable中只要有一个promise对象"完成（resolve）"或"失败（reject）"，
             * 新的promise就会立刻"完成（resolve）"或者"失败（reject）"，并获得之前那个promise对象的返回值或者错误原因。
             * */
            it('3-2-1) iterable中只要有一个promise对象"完成（resolve）"，Promise.race就会"完成（resolve）"',function(done) {
                let start = new Date().getTime();

                let p1 = new Promise(function(resolve,reject) {
                    setTimeout(resolve,10,'data p1');
                });
                let p2 = new Promise(function(resolve,reject){
                    setTimeout(resolve,20,'data p2');
                });

                let p = Promise.race([p1,p2]);
                p.then(
                    function onResolve(data){
                        let end = new Date().getTime() - start;

                        expect(end>=10 && end < 20).toBe(true);
                        expect(data).toBe('data p1');
                        done();
                    },
                    function onReject(){}
                );
            });

            it('3-2-2) iterable中只要有一个promise对象"失败（reject）"，Promise.race就会"失败（reject）"',function(done) {
                let start = new Date().getTime();

                let p1 = new Promise(function(resolve,reject) {
                    setTimeout(reject,10,'error p1');
                });
                let p2 = new Promise(function(resolve,reject){
                    setTimeout(resolve,20,'data p2');
                });

                let p = Promise.race([p1,p2]);
                p.then(
                    function onResolve(data){
                    },
                    function onReject(reason){
                        let end = new Date().getTime() - start;

                        expect(end>=10 && end < 20).toBe(true);
                        expect(reason).toBe('error p1');
                        done();
                    }
                );
            });
        });

        describe('3-3) Promise.resolve(value)',function() {
            /**
             * 返回一个以给定值解析后的Promise对象
             * 参数：
             *  value:
             *   1. 如果value是一个原始类型值，以该值为成功状态返回promise；
             *   2. 如果value是一个thenable对象（即带有then 方法），以thenable对象指定的状态返回promise；
             *   3. 如果value是一个promise对象，以该promise的状态返回promise；
             * */
            it('3-3-1) value是一个原始类型',function() {
                let p = Promise.resolve(1);
                p.then(
                    function onResolve(data){
                        expect(data).toBe(1);
                    }
                );

                let p2 = Promise.resolve([1,2]);
                p2.then(
                    function onResolve(data){
                        expect(data).toEqual([1,2]);
                    }
                );
            });

            it('3-3-2) value是一个thenable对象',function(done){
                let thenable = {
                    then: function(onResolve,onReject){
                        onResolve('完成');
                    }
                };
                let p = Promise.resolve(thenable);
                p.then(
                    function onResolve(data){
                        expect(data).toBe('完成');
                        done();
                    },
                    function onReject(reason){}
                );
                /**
                 * p对象的状态采用的是thenable对象中then方法指定的状态；
                 * */
            });

            it('3-3-3) value是一个promise对象',function(done){
                let p = new Promise(
                    function executor(resolve,reject){
                        resolve(1);
                    }
                );
                let p1 = Promise.resolve(p);
                //一位p是"完成"状态，新生成的p1将会延用p的状态，也是"完成"状态
                p1.then(
                    function onResolve(data){
                        expect(data).toBe(1);
                        done();
                    },
                    function onReject(reason){
                        // 这里不会执行；
                    }
                );
            });
        });

        describe('3-4) Promise.reject(reason)',function(){
            /**
             * 返回一个"失败（reject）"状态的promise，失败原因为reason值；
             *
             * */
            it('3-4-1) 基本用法',function(done) {
                let promise = Promise.reject('some error');
                promise.then(
                    function onResolve(){
                        //这里不会执行
                    },
                    function onReject(reason){
                        expect(reason).toBe('some error');
                        done();
                    }
                );
            });
        });
    });

    // describe('4) 附加方法',function() {
    //     it('4-1) done方法',function(done) {
    //         /**
    //          * promise调用链,不管以then方法或catch方法结尾，要是最后一个方法抛出错误，
    //          * 都有可能无法捕捉到,因为Promise内部的错误不会冒泡到全局,
    //          * 所以将done方法置于promise调用链底端，
    //          * 以此来保证抛出任何可能出现的错误
    //          * */
    //         // 实现代码；
    //         Promise.prototype.done = function() {
    //             this.catch(reason=>{
    //                      throw reason;
    //                 });
    //         };
    //         // 用法
    //         /**
    //          * promise
    //          *      .then(
    //          *          ()=>{},
    //          *          ()=>{}
    //          *       )
    //          *      .catch(
    //          *          ()=>{
    //          *              throw 'oop...';
    //          *          }
    //          *      )
    //          *      .done();
    //          *
    //          * */
    //         pending();
    //     });
    //
    //     it('4-2) finally方法',function() {
    //         /**
    //          * 用于指定不管Promise对象最后状态如何，都会执行的操作。
    //          * */
    //         pending();
    //     });
    //
    //     it('4-3) Promise.try方法',function(){
    //         /**
    //          * 实际开发中，经常遇到一种情况：不知道或者不想区分，函数f是同步函数还是异步操作，但是想用 Promise 来处理它。
    //          * */
    //         pending();
    //     })
    // });
});