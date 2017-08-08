describe('Day 11: Proxy对象', function() {
    /**
     * Proxy 对象用于修改某些基础操作的默认行为
     * */
    describe('1) 基本用法', function() {
        it('1-1) 语法示例', function() {
            /**
             * var p = nwe Proxy(target,handler);
             * target: 可以是任何类型的对象，表示所要拦截的目标对象;
             * handler: 一个对象，定义了具体的代理行为；
             * */

            // demo: 拦截target 对象的属性读取操作
            let target = {name: 'direct'};
            // 定义新的属性读取操作
            let handler = {
                get: function(target, key, receiver) {
                    return 'proxy';
                }
            };
            let proxy = new Proxy(target,handler);

            expect(proxy.name).toBe('proxy');

            // 如果handler是个空对象，就表示没有拦截操作，直接通向原对象；
            let proxy2 = new Proxy(target, {});
            expect(proxy2.name).toBe('direct');
        });
    });

    describe('2) handler对象的方法', function() {
        it('2-1) handler.get', function() {
            /**
             * 用于拦截target的属性的读取操作:
             * new Proxy(target,{
             *     get: function(target, property, receiver)
             * })
             * 参数：
             *  target: 目标对象；
             *  property: 读取的属性的名称；
             *  receiver: 代理对象自身或者继承了代理的对象；
             * 注：
             *  this对象：绑定在handler上面；
             * */
            let t = {n: 'direct'};
            let r;
            let handler = {
                get: function(target, property, receiver) {
                    r = receiver;
                    return `proxy get ${property}`;
                }
            };
            let proxy = new Proxy(t, handler);
            expect(proxy.n).toBe('proxy get n');
            expect(proxy).toBe(r);

            /**
             * 可拦截的场景：
             *  1. 属性读取： 比如 proxy[foo]或者proxy.bar；
             *  2. 继承的属性的读取：比如 Object.create(proxy)[foo]，也就是原型链上的属性读取
             *  3. Reflect.get
             * */
            //2 继承的属性的读取
            let t2 = {n: 'direct'};
            let handler2 = {
                get: function() {
                    return 'proxy';
                }
            };
            let proxy2 = new Proxy(t2, handler2);
            //obj2继承了拦截器对象；或者说proxy2对象在obj2的原型上；
            let obj2 = Object.create(proxy2);

            // 原型链上的n属性的读取操作被拦截了；
            expect(obj2.n).toBe('proxy');

            // 而obj2自身的属性读取没有被拦截
            obj2.ownProperty1 = 'direct';
            expect(obj2.ownProperty1).toBe('direct');
            expect(Object.prototype.hasOwnProperty.call(obj2, 'ownProperty1')).toBeTruthy();

            // 3 Reflect.get: 获取一个对象上的属性值,类似于对象上的属性访问器；
            // 读取proxy2 对象的'n'属性
            expect(Reflect.get(proxy2,'n')).toBe('proxy');

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误
             *  1. 如果目标对象的属性为'non-writable'、'non-configurable'的数据属性，
             *     那么对拦截器相关属性进行get读取操作时，handler.get必须返回和原目标属性相同的值，
             *     否则会发生冲突；
             *  2. 如果目标对象的属性为'non-configurable'、并且它的[[get]]访问器为undefined，
             *     那么对拦截器相关属性进行get读取操作时，handler.get必须返回undefined,
             *     否则会发生冲突；
             * */

            //冲突场景1
            let target3 = {};
            Object.defineProperty(target3, 'a', {
                configurable: false,
                enumerable: false,
                value: 'direct',
                writable: false
            });
            let proxy3 = new Proxy(target3, {
                get: function() {
                    // target3的'a'属性为'non-writable'、'non-configurable'；
                    // 在proxy3上访问'a'属性时，这里必须返回与target.a相同的值
                    // 然而并没有
                    return 'proxy';
                }
            });
            expect(function() {
                //get操作
                proxy3.a;
            }).toThrow();

            //冲突场景2
            let target4 = {};
            Object.defineProperty(target4, 'a', {
                get: undefined,
                set: function() {},
                configurable: false,
                enumerable: false
            });
            let proxy4 = new Proxy(target4, {
                get: function() {
                    // target4的'a'属性为'non-configurable',并且[[get]]访问器为undefined
                    // 在proxy4对象上访问'a'属性时，这里必须返回undefined；
                    // 然而并没有
                    return 'proxy';
                }
            });
            expect(function() {
                proxy4.a;
            }).toThrow();
        });

        it('2-2) handler.set', function() {
            /**
             *  用于拦截一个属性的赋值操作;
             *  new Proxy(target,{
             *      set: function(target, property, value, receiver)
             *  })
             *
             *  参数：
             *   target: 目标对象
             *   property: 需要赋值的属性的名字
             *   value: 将要为属性设置的新值
             *   receiver: 赋值操作直接针对的对象，通常是proxy自身；但赋值操作有时并不是直接执行，而是通过原型链或其他方式；
             *
             *  返回值：
             *   应该返回一个boolean值，设置操作成功返回true；
             *   如果set方法返回了false、并且赋值操作发生在严格模式下，应该抛出TypeError错误；
             * */
            let target1 = {};
            let proxy1 = new Proxy(target1, {
                set: function(target, property, value, receiver) {
                    target[property] = value;
                }
            });
            proxy1.a = 1;
            expect(target1.a).toBe(1);

            /**
             * 可拦截的场景：
             * 1. 属性赋值： 例：proxy[foo] = bar 或者 proxy.foo = bar;
             * 2. 继承属性赋值： 例：Object.create(proxy)[foo] = bar;
             * 3. Reflect.set()
             * */

            //拦截场景2
            let target2 = {a: 'direct'};
            let proxy2 = new Proxy(target2, {
                set: function(target, property, value, receiver) {
                    target[property] = 'proxy: ' + value;
                    return true;
                }
            });
            let obj2 = Object.create(proxy2);
            obj2.a = 'new';
            expect(obj2.a).toBe('proxy: new');

            obj2.b = 'b';
            expect(obj2.b).toBe('proxy: b');
            expect(Object.prototype.hasOwnProperty.call(obj2, 'b')).toBeFalsy();
            expect(Object.prototype.hasOwnProperty.call(target2, 'b')).toBeTruthy();

            // 拦截场景3
            // Reflect.set: 用于设置一个对象上的某个属性的值
            Reflect.set(obj2,'c','hi');
            expect(obj2.c).toBe('proxy: hi');

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误
             *  1. 如果目标对象的属性为'non-writable'并且'non-configurable'的数据属性，
             *     那么在执行set操作时，不可以修改属性的值，
             *     否则会发生冲突；
             *  2. 如果目标对象的属性为'non-configurable'、并且它的[[set]]访问器为undefined，
             *     那么不能为该属性赋值；
             *     否则会发生冲突；
             *  3. 在严格模式下，handler.set方法如果返回false，handler.set将抛出TypeError异常；
             * */
                //冲突场景1
            let target3 = {};
            Object.defineProperty(target3, 'a', {
                value: 'direct',
                enumerable: true,
                configurable: false,
                writable: false
            });
            let proxy3 = new Proxy(target3, {
                set: function(target, property, value, receiver) {
                    target[property] = value;
                    return true;
                }
            });

            expect(function() {
                proxy3.a = 'proxy';
            }).toThrow();

            //冲突场景2
            let target4 = {};
            Object.defineProperty(target4, 'a', {
                set: undefined,
                configurable: false,
                enumerable: true
            });
            let proxy4 = new Proxy(target4, {
                set: function(t, p, v, r) {
                    return !!(t[p] = v);
                }
            });
            expect(function() {
                proxy4.a = 'proxy';
            }).toThrow();

            //冲突场景3
            let target5 = {};
            let proxy5 = new Proxy(target5, {
                set: function() {
                    return false;
                }
            });

            (function() {
                'use strict';
                expect(function() {
                    proxy5.b = 1;
                }).toThrow();
            })();
        });

        it('2-3) handler.apply', function() {
            /**
             * 用于拦截函数的调用
             * handler = {
             *     apply: function(target,thisArg,argumentsList){
             *
             *     }
             * }
             *
             * 参数：
             *  target: 目标对象；
             *  thisArg: 函数调用时绑定的this对象；
             *  argumentsList: 函数调用时的参数列表；
             * 返回：
             *  可以是任何值
             * */
            // 为target 函数提供默认参数
            let target = function(obj) {
                    obj.city = 'cz';
                    return obj;
                };
            let proxy = new Proxy(target, {
                apply: function(target, thisArg, argumentsList) {
                    if(argumentsList.length === 0) {
                        return target({});
                    } else {
                        return target(...argumentsList);
                    }
                }
            });
            //没有参数
            expect(proxy()).toEqual({city: 'cz'});
            //有参数
            expect(proxy({name: 'qy'})).toEqual({name: 'qy', city: 'cz'});


            /**
             * 拦截场景
             * 1. 函数调用： proxy(...args)
             * 2. Function.prototype.apply调用，Function.prototype.call调用
             * 3. Reflect.apply()
             * */
        });

        it('2-4) handler.has', function() {
            /**
             * 用来拦截 in 操作符
             * handler = {
             *     has: function(target,property)
             * }
             * 参数：
             *  target：目标对象；
             *  property：属性名称，用于检验属性是否存在
             *
             * 返回：
             *  必须返回一个boolean类型值
             * */

            // 用来隐藏某些属性,不被in发现
            let target = {name: 'qy', girlFriends: ['siri', '小娜']};
            let proxy = new Proxy(target, {
                has: function(target, property) {
                    if(property === 'girlFriends') {
                        return false;
                    } else {
                        return Object.prototype.hasOwnProperty.call(target, property);
                    }
                }
            });
            expect('name' in proxy).toBeTruthy();
            expect('girlFriends' in proxy).toBeFalsy();

            /**
             * 拦截场景：
             * 1. 属性查询： 例：foo in proxy
             * 2. 继承的属性查询： 例： foo in Object.create(proxy)
             * 3. with 验证： 例：with(proxy){ (foo); }
             * 4. Reflect.has()
             * */

            // 拦截场景3: 对with隐藏以下划线开头的属性
            let target2 = {_a: 1, b: 2};
            let proxy2 = new Proxy(target2, {
                has: function(target, property) {
                    if(property.indexOf('_') === 0) {
                        return false;
                    } else {
                        return !!target2[property];
                    }
                }
            });
            with(proxy2) {
                expect(typeof _a).toBe('undefined');
                expect(typeof b).toBe('number');
            }

            // 拦截场景4：
            // Reflect.has: 功能与 in 操作符相同
            expect(Reflect.has(proxy2,'_a')).toBe(false);
            expect(Reflect.has(proxy2,'b')).toBe(true);



            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误
             * 1. 如果目标对象的某个自身拥有的属性为'non-configurable',
             *    那么对于该属性，handler.has不可以返回false;
             *    否则会发生冲突；
             * 2. 如果目标对象不可扩展，
             *    那么对于该对象自身拥有的属性，handler.has不可以返回false；
             *    否则会发生冲突；
             * */
            // 冲突场景1
            let target3 = {};
            Object.defineProperty(target3, 'a', {
                value: 1,
                configurable: false,
                writable: false,
                enumerable: true
            });
            let proxy3 = new Proxy(target3, {
                has: function(target, property) {
                    return false;
                }
            });
            expect(function() {
                ('a' in proxy3);
            }).toThrow();

            //冲突场景2
            let target4 = {a: 1};
            Object.preventExtensions(target4);
            let proxy4 = new Proxy(target4, {
                has: function() {
                    return false;
                }
            });
            expect(function() {
                ('a' in proxy4);
            }).toThrow();

        });

        it('2-5) handler.construct', function() {
            /**
             * 用于拦截new操作符；
             * 注：用于实例化proxy的target对象必须拥有[[Construct]]内置方法；
             * handler = {
             *     construct: function(target, argumentsList,newTarget)
             * }
             * 参数：
             *  target：目标对象；
             *  argumentsList: 构造函数的参数列表
             *  newTarget: 生成的proxy实例
             * */
            let Target = function() {
            };
            let TargetProxy = new Proxy(Target, {
                construct: function(target, argumentsList, newTarget) {
                    let o = new target(...argumentsList);
                    o.name = 'qy';
                    newTarget.hi = function() {
                    };
                    return o;
                }
            });
            let proxy = new TargetProxy();
            expect(proxy.name).toBe('qy');
            expect(TargetProxy.hi).not.toBeUndefined();

            //如果target是普通对象，那么会报错
            let target2 = {};
            let proxy2 = new Proxy(target2, {
                construct: function() {
                    return {};
                }
            });
            expect(function() {
                new proxy2();
            }).toThrow();


            /**
             * 拦截场景：
             *  1. new proxy(...args);
             *  2. Reflect.construct(target,argumentsList[,newTarget])： 和new操作符功能一样，等价于 new target (...argumentsList) 操作
             * */


            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             *  1. handler.construct必须返回一个对象；
             *     否则会发生冲突；
             * */
            //冲突场景1
            let Target3 = function() {
                };
            let Target3Proxy = new Proxy(Target3, {
                construct: function() {
                    return '';
                }
            });
            expect(function() {
                new Target3Proxy();
            }).toThrow();
        });

        it('2-6) handler.deleteProperty', function() {
            /**
             * 用于拦截delete操作
             * handler = {
             *     deleteProperty: function(target,property)
             * }
             * 参数：
             *  target：目标对象；
             *  property：将要删除的对象的属性名称；
             * 返回：
             *  必须返回一个boolean值，用以表示是否删除成功；
             * */
            let target = {};
            let lastDeleted = null;
            let proxy = new Proxy(target, {
                deleteProperty: function(target, property) {
                    if(property in target) {
                        delete target[property];
                        lastDeleted = property;
                        return true;
                    } else {
                        //console.log('property not found: '+ property);
                        return false;
                    }
                }
            });
            proxy.a = 1;
            delete proxy.a;
            expect('a' in proxy).toBe(false);
            expect(lastDeleted).toBe('a');

            //non-configurable属性；
            Object.defineProperty(target, 'b', {
                value: 1,
                configurable: false,
                writable: false,
                enumerable: true
            });
            expect(function() {
                delete proxy.b;
            }).toThrow();

            /**
             * 拦截场景：
             * 1. 属性删除：例：delete proxy[foo] 或 delete proxy.foo;
             * 2. Reflect.deleteProperty(): 和 delete 操作符功能相同，用来删除对象上面的属性；
             * */

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             *  1. 如果目标对象的某个自身拥有的属性为'non-configurable'，那么这个属性不可以删除；
             *     否则会发生冲突；
             * */

        });

        it('2-7) handler.defineProperty', function() {
            /**
             * 拦截Object.defineProperty操作；
             * handler = {
             *     defineProperty: function(target,property,descriptor)
             * }
             * 参数：
             *  target：目标对象；
             *  property：将要修改其描述符的属性的名称；
             *  descriptor：将要定义或修改的属性的描述符；
             * 返回：
             *  必须返回一个boolean值，表示操作是否成功；
             * */

            let target = {};
            let proxy = new Proxy(target, {
                defineProperty: function(target, property, descriptor) {
                    let newValue = {value: 'ES2015 ' + descriptor.value};
                    let newDescriptor = Object.assign(descriptor, newValue);
                    Object.defineProperty(target, property, newDescriptor);
                    return true;
                }
            });

            proxy.a = 1;
            expect(proxy.a).toBe('ES2015 1');


            /**
             * 拦截场景：
             * 1. Object.defineProperty();
             * 2. Reflect.defineProperty();
             * */
            // 场景1
            Object.defineProperty(proxy,'b',{value: 1,configurable: true,writable: true,enumerable: true});
            expect(proxy.b).toBe('ES2015 1');

            // 场景2
            Reflect.defineProperty(proxy,'c',{value: 2,configurable: true,writable: true,enumerable: true});
            expect(proxy.c).toBe('ES2015 2');

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             * 1. 如果目标对象不可扩展（not extensible），那么代理对象无法添加属性；
             *    否则发生冲突；
             * 2. 不可以为代理对象添加新的'non-configurable'属性，
             *    否则会发生冲突；
             * 3. 如果目标对象上的某个属性是configurable，不可以将它改为'non-configurable';
             *    否则发生冲突；
             * 4. 如果一个属性在目标对象上存在，那么Object.defineProperty(target,prop,descriptor)不会抛出异常；
             *
             * 5. 在严格模式下，如果handler.defineProperty返回false，handler会抛出一个TypeError异常；
             * */
            //冲突1
            let target2 = {};
            Object.preventExtensions(target2);
            let proxy2 = new Proxy(target2, {
                defineProperty: function(target, property, descriptor) {
                    return true;
                }
            });
            expect(function() {
                Object.defineProperty(proxy2, 'a', {
                    value: 1
                });
            }).toThrow();

            //冲突2
            let target3 = {};
            let proxy3 = new Proxy(target3, {
                defineProperty: function(target, property, descriptor) {
                    return true;
                }
            });
            expect(function() {
                Object.defineProperty(proxy3, 'a', {value: 1, configurable: false,writable:true,enumerable:true});
            }).toThrow();

        });

        it('2-8) handler.getOwnPropertyDescriptor',function() {
            /**
             * 拦截Object.getOwnPropertyDescriptor方法；
             * handler = {
             *     getOwnPropertyDescriptor: function(target,prop)
             * }
             * 参数：
             *  target： 目标对象；
             *  prop：需要获取描述符的属性的名称；
             * 返回：
             *  必须是一个对象或者undefined
             * */
            //示例： 用来隐藏特定属性的描述符
            let target = {_a: 1,b:2};
            let proxy = new Proxy(target,{
                getOwnPropertyDescriptor: function(target,property) {
                    if(property.charAt(0)==='_'){
                        return undefined;
                    }else{
                        return Object.getOwnPropertyDescriptor(target,property);
                    }
                }
            });
            expect(Object.getOwnPropertyDescriptor(proxy,'_a')).toBeUndefined();
            expect(Object.getOwnPropertyDescriptor(proxy,'b')).not.toBeUndefined();

            /**
             * 拦截场景：
             *  1. Object.getOwnPropertyDescriptor()
             *  2. Reflect.getOwnPropertyDescriptor()
             * */

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             * 1. handler.getOwnPropertyDescriptor必须返回一个对象或者undefined，
             *    否则发生冲突；
             * 2. 如果一个属性在目标对象上是'non-configurable'的，那么不可以返回undefined,
             *    否则发生冲突；
             * 3. 如果目标对象不可扩展，那么对于目标对象上自身拥有的属性，不可以返回undefined，
             *    否则发生冲突；
             * 4. 如果目标对象不可扩展，那么对于目标对象上不存在的属性，必须返回undefined，
             *    否则发生冲突；
             * 5. 如果一个属性不是目标对象的自身属性、
             *    或者该属性是目标对象自身拥有的'configurable'属性，
             *    那么该属性不可以描述为'non-configurable'的；
             *    否则发生冲突；
             * 6. Object.getOwnPropertyDescriptor(target)的结果可以通过Object.defineProperty用在目标对象上，
             *    不会产生异常；
             * */
            //冲突2
            let target2 = {};
            Object.defineProperty(target2,'a',{
                value: 1,
                configurable: false
            });
            let proxy2 = new Proxy(target2,{
                getOwnPropertyDescriptor: function(target,prop) {
                    return undefined;
                }
            });
            expect(function() {
                Object.getOwnPropertyDescriptor(proxy2,'a');
            }).toThrow();
        });

        it('2-9) handler.getPrototypeOf',function() {
            /**
             * 用来拦截获取对象的原型的操作，也就是拦截[[GetPrototypeOf]]内部方法
             * handler = {
             *     getPrototypeOf: function(target)
             * }
             * 参数：
             *  target： 目标对象；
             * 返回：
             *  必须返回对象或者null
             * */
             let target = {},
                 customPrototype = {};
             let proxy = new Proxy(target,{
                 getPrototypeOf: function(target) {
                     return customPrototype;
                 }
             });
             let r = Object.getPrototypeOf(proxy);
             expect(r).toBe(customPrototype);

            /**
             * 拦截场景：
             * 1. Object.getPrototypeOf()
             * 2. Reflect.getPrototypeOf()
             * 3. __proto__
             * 4. Object.prototype.isPrototypeOf()
             * 5. instanceof
             * */
            let target2 = {};
            let proxy2 = new Proxy(target2,{
                getPrototypeOf: function(target) {
                    return Array.prototype;
                }
            });
            expect(Object.getPrototypeOf(proxy2)).toBe(Array.prototype);
            expect(Reflect.getPrototypeOf(proxy2)).toBe(Array.prototype);
            expect(proxy2.__proto__).toBe(Array.prototype);
            expect(Array.prototype.isPrototypeOf(proxy2)).toBeTruthy();
            expect(proxy2 instanceof Array).toBeTruthy();

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             * 1. handler.getPrototypeOf 必须返回Object或者null,
             *    否则发生冲突；
             * 2. 如果目标对象是不可扩展的，
             *    那么Object.getPrototypeOf(proxy)方法必须返回与Object.getPrototypeOf(target)相同的结果；
             *    否则发生冲突；
             * */
            // 冲突场景1
            let target3 = {};
            let proxy3 = new Proxy(target3,{
                getPrototypeOf: function(target) {
                    return 'hi~';
                }
            });
            expect(function(){
                Object.getPrototypeOf(proxy3)
            }).toThrow();

            // 冲突场景2
            let target4 = {};
            Object.preventExtensions(target4);
            let proxy4 = new Proxy(target4,{
                getPrototypeOf: function(target) {
                    return {};
                }
            });
            expect(function() {
                Object.getPrototypeOf(proxy4);
            }).toThrow();
        });

        it('2-10) handler.isExtensible',function() {
            /**
             * 用于拦截Object.isExtensible()操作
             * handler = {
             *     isExtensible: function(target)
             * }
             * 参数：
             *  target: 目标对象
             * 返回：
             *  必须返回boolean值
             * */
            let target = {};
            let isCalled = 'no';
            let proxy = new Proxy(target,{
                isExtensible: function(target) {
                    isCalled = 'yes';
                    return true;
                }
            });
            Object.isExtensible(proxy);
            expect(isCalled).toBe('yes');

            /**
             * 拦截场景：
             * 1. Object.isExtensible()
             * 2. Reflect.isExtensible()
             * */

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             * 1. Object.isExtensible(proxy)必须返回与Object.isExtensible(target)相同的值；
             *    否则发生冲突；
             * */
        });
        
        it('2-11) handler.ownKeys',function() {
            /**
             * 用来拦截对象自身属性的读取操作。
             * handler = {
             *     ownKeys: function (target)
             * }
             * 参数：
             *  target：目标对象；
             * 返回：
             *  必须返回一个可枚举的对象；
             * */
            let target = {};
            let proxy = new Proxy(target,{
                ownKeys: function(target){
                    return ['a','b','c'];
                }
            });
            let result = Object.getOwnPropertyNames(proxy);
            expect(result).toEqual(['a','b','c']);

            /**
             * 拦截场景：
             * 1. Object.getOwnPropertyNames();
             * 2. Object.getOwnPropertySymbols();
             * 3. Object.keys();
             * 4. Reflect.ownKeys();
             * */
            //场景1：略；

            //场景2：
            let target2 = {
                a: 0,
                [Symbol.for('b')]: 1,
                [Symbol('c')]: 2
            };
            let proxy2 = new Proxy(target2,{
                ownKeys:function(target) {
                    return ['a',Symbol('unknown'),Symbol.for('b')];
                }
            });
            let result2 = Object.getOwnPropertySymbols(proxy2);
            //因为Symbol类型是无法判断相等的，所以转化为字符串进行比较
            result2  = result2.map(item=>item.toString());
            expect(result2).toEqual(["Symbol(unknown)","Symbol(b)"]);
            //可以看到，Object.getOwnPropertySymbols自动把字符串类型的键'a'过滤掉了；

            //场景3：
            let target3 = {
                a: 1,
                b: 2,
                [Symbol.for('foo')]: 'foo'
            };
            //添加不可枚举属性c
            Object.defineProperty(target3,'c',{
                value: 3,
                enumerable: false
            });
            //Object.key方法会自动过滤以下属性：
            //--目标对象上不存在的属性
            //--属性名为Symbol的属性
            //--不可遍历的属性
            let proxy3 = new Proxy(target3,{
                ownKeys:function(target) {
                    return ['a','b','c','d',Symbol.for('foo')]
                }
            });
            let result3 = Object.keys(proxy3);
            expect(result3).toEqual(['a','b']);
            //可以看到，不可枚举属性'c'、未知属性'd'、Symbol属性都被过滤了；

            //场景4：
            //let result4 = Reflect.ownKeys(proxy);
            //expect(result4).toEqual(['a','b','c']);

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             * 1. 必须返回一个数组；
             *    否则发生冲突；
             * 2. 数组的每个元素可以是String类型或者Symbol类型；
             *    否则发生冲突；
             * 3. 返回的数组必须包含目标对象的自身拥有的、'non-configurable'属性
             *    否则发生冲突；
             * 4. 如果目标对象是不可扩展的，那么返回的数组必须只包含目标对象的所有属性名，不能包含其他多余的值；
             *    否则发生冲突；
             * */
            //冲突1
            let proxy5 = new Proxy({},{
                ownKeys: function(target) {
                    return 'foo';
                }
            });
            expect(function() {
                Object.keys(proxy5);
            }).toThrow();

            //但如果是返回一个对象，不会抛出错误，则会自动转化成数组；
            let proxy5_2 = new Proxy({a: 1},{
                ownKeys: function(target) {
                    return {a: 'a'};
                }
            });
            let result5 = null;
            expect(function() {
                result5 = Object.keys(proxy5_2);
            }).not.toThrow();
            expect(result5).toEqual([]);

            //冲突2；
            let target6 = {a: 'foo'};
            let proxy6 = new Proxy(target6,{
                ownKeys: function(target) {
                    return [target.a];
                }
            });
            expect(function() {
                Object.keys(proxy6);
            }).not.toThrow();

            //改为Number类型
            target6.a = 1;
            expect(function() {
                Object.keys(proxy6);
            }).toThrow();

            //改为Object类型
            target6.a = {};
            expect(function() {
                Object.keys(proxy6);
            }).toThrow();

            //改为Boolean类型
            target6.a = false;
            expect(function() {
                Object.keys(proxy6);
            }).toThrow();

            //改为Null类型
            target6.a = null;
            expect(function() {
                Object.keys(proxy6);
            }).toThrow();

            //冲突3
            let target7 = {};
            Object.defineProperty(target7,'a',{
                value: 1,
                configurable: false
            });
            let proxy7 = new Proxy(target7,{
                ownKeys: function(target){
                    return ['b'];
                }
            });
            expect(function() {
                Object.keys(proxy7);
            }).toThrow();

            //冲突4
            let target8 = {a:1, b: 2};
            Object.preventExtensions(target8);
            let proxy8 = new Proxy(target8,{
                ownKeys: function(target) {
                    return [];
                }
            });
            expect(function() {
                Object.getOwnPropertyNames(proxy8);
            }).toThrow();
        });

        it('2-12) handler.preventExtensions',function() {
            /**
             * 用来拦截Object.preventExtensions操作
             * handler = {
             *     preventExtensions: function(target)
             * }
             * 参数：
             *  target： 目标对象
             * 返回：
             *  必须返回一个boolean值
             * */
            let target = {},
                isCalled = false;
            let proxy = new Proxy(target,{
                preventExtensions: function(target){
                    isCalled = true;
                    //关于返回true的情况见下文'冲突部分'
                    Object.preventExtensions(target);
                    return true;
                }
            });
            // 这一条chrome失效了。。。
            //expect(Object.preventExtensions(proxy)).toBe(false);
            //expect(isCalled).toBe(true);


            /**
             * 拦截场景
             * 1. Object.preventExtensions()
             * 2. Reflect.preventExtensions()
             * */

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             * 1. 只有Object.isExtensible(proxy)是false，Object.preventExtensions(proxy)才能返回true
             *    否则发生冲突；
             * */
            let target2 = {};
            let proxy2 = new Proxy(target2,{
                preventExtensions: function(target) {
                    return true;
                }
            });
            expect(function() {
                Object.preventExtensions(proxy2);
            }).toThrow();
        });

        it('2-13) handler.setPrototypeOf',function() {
            /**
             * handler = {
             *     setPrototypeOf: function(target,prototype)
             * }
             * 用于拦截Object.setPrototypeOf操作
             * 参数：
             *  target: 目标对象；
             *  prototype: 一个新的原型对象或者null
             * 返回：
             *  一个boolean值，true表示设置成功、false表示失败；
             * */
            // demo：
            // 如果想要禁止别人修改自己对象的原型，
            // 那么handler.setPrototypeOf方法可以返回false,也可以抛出异常；
            let target = {},
                newProto = {};
            let proxy = new Proxy(target,{
                setPrototypeOf: function(target,prototype){
                    return false;
                }
            });
            // 在handler.setPrototypeOf方法返回false时，
            // Object.setPrototypeOf方法抛出异常，
            // Reflect.setPrototypeOf方法则返回false
            expect(function() {
                Object.setPrototypeOf(proxy,newProto);
            }).toThrow();
            expect(Reflect.setPrototypeOf(proxy,newProto)).toBe(false);

            let target2 = {};
            let proxy2 = new Proxy(target2,{
                setPrototypeOf: function(target,prototype){
                    throw new Error('custom error');
                }
            });
            expect(function() {
                Object.setPrototypeOf(proxy2,newProto);
            }).toThrowError('custom error');
            expect(function() {
                Reflect.setPrototypeOf(proxy2,newProto);
            }).toThrowError('custom error');


            /**
             * 拦截的场景
             * 1. Object.setPrototypeOf()
             * 2. Reflect.setPrototypeOf()
             * */

            /**
             * 以下场景会发生冲突，proxy对象会抛出TypeError错误:
             * 1. 如果目标对象不可扩展，prototype参数必须与原目标对象的原型对象相同，
             *    也就是必须等于Object.getPrototypeOf(target);
             *    否则发生冲突;
             * */
        });
    });

    describe('3) 其他',function() {
        it('3-1) Proxy.revocable',function(){
            /**
             * 用于新建一个可以关闭（撤销）的Proxy对象；
             * Proxy.revocable(target,handler);
             * 参数：
             *  target： 目标对象；
             *  handler： 一个对象，它的属性是用于定义各种拦截操作的函数；
             * 返回：
             *  新建的可撤销的Proxy对象；
             *  可撤销的Proxy对象包含两个属性{proxy: proxy,revoke: revoke};
             *  proxy： 一个Proxy对象，通过new Proxy(target,handler)创建的；
             *  revoke： 一个没有参数的函数，用于使proxy失效；
             * */
            //示例：
            let target = {};
            let revocableProxy = Proxy.revocable(target,{
                get: function(target,name){
                    return `hi ${name}`;
                }
            });
            let proxy = revocableProxy.proxy;
            //get
            expect(proxy.qy).toBe('hi qy');

            //关闭（撤销）代理
            revocableProxy.revoke();
            expect(function() {
                (proxy.qy);
            }).toThrow();

            // Proxy.revocable的一个使用场景是：
            // 目标对象不允许直接访问，必须通过代理访问，一旦访问结束，就收回代理权，不允许再次访问。

        });

        it('3-2) this绑定问题',function() {
            //demo1:
            // target对象内部的this指向target，
            // proxy对象内部的this指向proxy
            let target = {
                foo(){
                    return this === proxy;
                }
            };
            let proxy = new Proxy(target,{});
            expect(target.foo()).toBeFalsy();
            expect(proxy.foo()).toBeTruthy();

            //demo2:
            //this指向的变化，导致Proxy无法代理目标对象属性；
            let _name = new WeakMap();
            class Person{
                constructor(name){
                    _name.set(this,name);
                }
                get name(){
                    return _name.get(this);
                }
            }
            let qy = new Person('qy');
            expect(qy.name).toBe('qy');

            let proxyQy = new Proxy(qy,{});
            expect(proxyQy.name).toBeUndefined();

            // demo3: 无法代理Date对象
            // 有些原生对象的内部属性，只有通过正确的this才能拿到，所以 Proxy 也无法代理；
            let date = new Date();
            let dateProxy = new Proxy(date,{});

            expect(function() {
                date.getDate();
            }).not.toThrow();

            expect(function() {
                dateProxy.getDate();
            }).toThrowError('this is not a Date object.');

            //这种时候，就只能手动管理this指向了。。。
        });

        it("3-3) 示例：Web 服务的客户端",function() {
            /**
             * Proxy 对象可以拦截目标对象的任意属性，这使得它很合适用来写 Web 服务的客户端。
             * 常规写法：
             * //新建一个Web服务接口：
             * let service = createWebService('http://localhost/api');
             * //获取各种信息：
             * service.getEmployees().then(...);
             * service.getTypes().then(...);
             * ....
             * */
            //Proxy 可以拦截这个对象的任意属性，所以不用为每一种数据写一个适配方法，只要写一个 Proxy 拦截就可以了。
            function createWebService(baseUrl){
                let proxy = new Proxy({},{
                    get(target,property,receiver){
                        return ()=> httpGet(baseUrl+'/'+propKey);
                    }
                });
                return proxy;
            }
            //具体使用：
            let serviceProxy = createWebService('http://localhost/api');
            /**
             * 获取数据：
             * serviceProxy.employees.then(...)
             * serviceProxy.types.then(...)
             *
             * */


        })
    })
});