describe('Day 12: Reflect对象',function() {
    /**
     * 概述：
     *  Reflect对象是一个内置对象，Reflect提供了诸多方法来解释JavaScript的行为；
     *  这些方法与proxy handler上的方法同名；
     *  同时这些方法中，有些方法与Object构造函数上的方法相一致；
     * 注：
     *  Reflect对象不是函数，不可调用；Reflect对象上的方法和属性都是静态的（这就和Math对象类似）
     *
     * Methods：
     *  Reflect.apply(target,thisArg,args)
     *  Reflect.construct(target,args)
     *  Reflect.get(target,name,receiver)
     *  Reflect.set(target,name,value,receiver)
     *  Reflect.defineProperty(target,name,desc)
     *  Reflect.deleteProperty(target,name)
     *  Reflect.has(target,name)
     *  Reflect.ownKeys(target)
     *  Reflect.isExtensible(target)
     *  Reflect.preventExtensions(target)
     *  Reflect.getOwnPropertyDescriptor(target, name)
     *  Reflect.getPrototypeOf(target)
     *  Reflect.setPrototypeOf(target, prototype)
     * */
    describe('1) Reflect设计目的',function(){
        it('1-1) 将语言内部方法放到Reflect对象上',function() {
            //原来有些内部方法是放在Object构造函数上的，比如 Object.defineProperty、Object.defineProperty；
            expect(typeof Reflect.defineProperty).toBe('function');
            expect(typeof Object.defineProperty).toBe('function');
        });

        it('1-2) 修改Object构造函数上的某些方法的返回结果，使其更合理',function() {
            // 比如 Object.defineProperty方法
            // 在无法定义属性的时候，Object.defineProperty会抛出错误
            // 而Reflect.defineProperty方法会返回false
            let obj = {};
            //定义了一个不可修改的属性'a'；
            Object.defineProperty(obj,'a',{
                value: 1,
                configurable: false,
                writable: false
            });

            //尝试通过Object.defineProperty修改
            expect(function() {
                Object.defineProperty('obj','a',{
                    value: 2
                });
            }).toThrow();

            //尝试通过Reflect.defineProperty修改
            let result = 'result';
            expect(function(){
                 result = Reflect.defineProperty(obj,'a',{
                     value: 2
                 });
            }).not.toThrow();
            expect(result).toBe(false);
        });

        it('1-3) 让某些命令式操作都变成函数行为',function() {
            // 比如 pp in obj 操作，可以用 Reflect.has(obj,pp);
            // 比如 delete obj[pp] 操作，可以用 Reflect.delete(obj, pp);
            let obj = {a: 1};
            expect('a' in obj).toBe(true);
            expect(Reflect.has(obj,'a')).toBe(true);
        });

        it('1-4) 可以让proxy handler方法方便地调用对应的Reflect方法，完成默认行为',function() {
            // Reflect对象的方法与Proxy对象的方法一一对应，只要是Proxy对象的方法，就能在Reflect对象上找到对应的方法;
            // 不管Proxy怎么修改默认行为，你总可以在Reflect上获取默认行为;
            let target = {'_a':1,'b':2};
            let proxy = new Proxy(target,{
                deleteProperty(target,property){
                    if(property.charAt(0)==='_'){
                        // 如果是'_'开头，那么什么都不做；
                        return false;
                    }else{
                        // 默认行为
                        Reflect.deleteProperty(target,property);
                        return true
                    }
                }
            });
            delete proxy['_a'];
            delete proxy['b'];
            expect('_a' in proxy).toBe(true);
            expect('b' in proxy).toBe(false);
        });
    });
    describe('2) Reflect对象一共13个静态方法，与proxy handler对象的方法一一对应',function() {
        it('2-1) Reflect.apply',function() {
            /**
             * 用给定的参数调用一个目标函数,在ES5中，一般会用Function.prototype.apply()来实现;
             *
             * Reflect.apply(target,thisArgument,argumentsList){}
             * 参数：
             *  target: 将要调用的目标函数
             *  thisArgument: 调用目标函数时要绑定的this上下文
             *  argumentsList： 一个array-like对象，用于指定目标函数调用时的参数
             * 返回：
             *  目标函数自身返回值
             *
             * 异常：
             *  如果target参数不是函数，那么会抛出TypeError错误；
             * */

            let foo = function(){
                return this.name + ' with arg: ' + [...arguments].join(',');
            };
            let thisArg = {name: 'fooFn'};
            let r = Reflect.apply(foo,thisArg,['a1','b2','c3']);
            expect(r).toBe('fooFn with arg: a1,b2,c3');
        });

        it('2-2) Reflect.construct',function() {
            /**
             * 和new操作符功能一样，等价于 new target (...args) 操作
             *
             * Reflect.construct(target,argumentsList[,newTarget]){}
             * 参数：
             *  target： 目标函数；
             *  argumentsList： 一个array-like对象，用于指定目标函数调用时的参数；
             *  newTarget： 指定实例的原型对象以及constructor属性，如果未提供该参数，那么就会指向target函数；
             * 返回：
             *  target的一个新的实例对象；
             *
             * 异常：
             *  如果target或者newTarget不是构造函数，则抛出TypeError错误
             * */
            //demo1: 基本用法
            let Foo = function(name,age){
                this.name = name;
                this.age = age;
            };
            let foo = Reflect.construct(Foo,['qy',11]);
            expect(foo instanceof Foo).toBe(true);
            expect(foo.name).toBe('qy');
            expect(foo.age).toBe(11);

            //demo2: newTarget参数
            let Foo2 = function(name){
                this.name = name;
            };
            let NewTarget = function(){};
            let foo2 = Reflect.construct(Foo2,['qy'],NewTarget);
            //foo2实例的属性是由Foo2构造函数生成的
            expect(foo2.name).toBe('qy');
            //foo2实例的原型对象是NewTarget的原型
            expect(foo2.__proto__).toBe(NewTarget.prototype);
            expect(foo2.constructor).toBe(NewTarget);
        });

        it('2-3) Reflect.get',function() {
            /**
             * 获取一个对象上的属性值,类似于对象上的属性访问器；
             *
             * Reflect.get(target,propertyKey[,receiver])
             * 参数：
             *  target： 目标对象；
             *  propertyKey: 属性名称；
             *  receiver： 触发属性的getter访问器时，绑定的this值
             * 返回：
             *  目标对象上的该属性对应的值；
             *
             * 异常：
             *  如果target不是一个对象，那么会抛出TypeError
             *
             * */
            let obj = {a: 1,b:2};
            expect(Reflect.get(obj,'a',{a: 2})).toBe(1);

            //receiver
            let obj2 = {};
            Object.defineProperty(obj2,'a',{
                get: function() {
                    return this.hi;
                }
            });
            expect(Reflect.get(obj2,'a',{hi: 'hello,I\'m receiver'})).toBe("hello,I'm receiver");
            // 一个关于receiver的介绍
            // https://stackoverflow.com/questions/37563495/what-is-a-receiver-in-javascript
        });

        it('2-4) Reflect.set',function() {
            /**
             * 用于设置一个对象上的某个属性的值
             *
             * Reflect.set(target,propertyKey,value[,receiver])
             *
             * 参数：
             *  target：目标对象，将要设置的属性所在的对象；
             *  propertyKey： 属性名称；
             *  value： 将要设置的值；
             *  receiver： 触发属性的setter访问器时，绑定的this值；
             * 返回：
             *  一个boolean，表示属性设置是否成功；
             * 异常：
             *  如果target不是一个对象，会抛出TypeError；
             * */
            let obj = {};
            Reflect.set(obj,'a',1);
            expect(obj.a).toBe(1);

            //receiver
            let a = null;
            let obj2 = {
                set a(value){
                    a = this.hi;
                },
                get a(){
                    return a;
                }
            };
            let thisArg = {hi: 'hello'};
            Reflect.set(obj2,'a',2,thisArg);
            expect(obj2.a).toBe('hello');
        });

        it('2-5) Reflect.defineProperty',function() {
            /**
             * 和Object.defineProperty 功能相同，但返回值不同；
             * Reflect.defineProperty 返回一个boolean类型；
             * Object.defineProperty 返回一个对象或者是在定义属性失败的时候抛出异常；
             *
             * Reflect.defineProperty(target, propertyKey,attributes)
             * 参数：
             *  target：目标对象，将在该对象上定义属性；
             *  propertyKey： 将要定义的属性的名称；
             *  attributes： 将要定义的属性的描述符（attributes）；
             * 返回：
             *  一个boolean类型值，表示属性定义是否成功；
             * 异常：
             *   如果target不是一个对象，会抛出TypeError；
             *
             * */
            //操作成功后的返回值测试
            let target1 = {};
            let result1 = Reflect.defineProperty(target1,'a',{
                value: 1,
                configurable: true,
                writable: true,
                enumerable: true
            });
            expect(result1).toBe(true);
            result1 = Object.defineProperty(target1,'b',{
                value: 2
            });
            expect(result1).toBe(target1);

            //操作失败后的情况
            //本demo与 "Reflect设计目的 2)修改Object构造函数上的某些方法的返回结果，使其更合理" 相同；
            let obj = {};
            //定义了一个不可修改的属性'a'；
            Object.defineProperty(obj,'a',{
                value: 1,
                configurable: false,
                writable: false
            });

            //尝试通过Object.defineProperty修改
            expect(function() {
                Object.defineProperty('obj','a',{
                    value: 2
                });
            }).toThrow();

            //尝试通过Reflect.defineProperty修改
            let result = 'result';
            expect(function(){
                result = Reflect.defineProperty(obj,'a',{
                    value: 2
                });
            }).not.toThrow();
            expect(result).toBe(false);
        });

        it('2-6) Reflect.deleteProperty',function() {
            /**
             * 和 delete 操作符功能相同，用来删除对象上面的属性；
             *
             * Reflect.deleteProperty(target,propertyKey)
             * 参数：
             *  target： 目标对象，将要删除它上面的属性；
             *  propertyKey： 将要删除的属性的名称；
             * 返回：
             *  一个boolean值，表示是否删除成功
             * 异常：
             *  如果target不是一个对象，会抛出异常；
             * */
            let obj = {x:1};
            let r = Reflect.deleteProperty(obj,'x');
            expect(r).toBe(true);
            expect(obj.x).toBeUndefined();

            //删除不存在的属性，也会返回true；
            r = Reflect.deleteProperty(obj,'x');
            expect(r).toBe(true);
        });

        it('2-7) Reflect.has',function() {
            /**
             * 功能与 in 操作符相同
             *
             * Reflect.has(target,propertyKey)
             * 参数：
             *  target： 目标对象，在该对象上查找属性；
             *  propertyKey： 所检测属性的名称；
             * 返回：
             *  一个boolean值，表示目标对象是否拥有该属性；
             * 异常：
             *  如果target不是对象，会抛出错误；
             * */
            let target = {x: 1};
            expect(Reflect.has(target,'x')).toBe(true);
            expect(Reflect.has(target,'y')).toBe(false);
        });

        it('2-8) Reflect.ownKeys',function() {
            /**
             * 返回一个的数组，包含了某个对象的所有自身拥有的属性；
             *
             * Reflect.ownKeys(target)
             * 参数：
             *  target： 目标对象，将获取它上面的自身属性；
             * 返回：
             *  一个数组，包含了target自身拥有的所有属性；
             * 异常：
             *  如果target不是对象，会抛出TypeError错误；
             * */
            //支持字符串属性
            let obj1 = {x:1,y:2};
            let obj1Prototype = Reflect.getPrototypeOf(obj1);
            obj1Prototype.z = 3;
            let result1 = Reflect.ownKeys(obj1);
            expect(result1).toEqual(['x','y']);

            //也支持Symbol类型属性
            let obj2 = {
                [Symbol.for('x')]: 1,
                [Symbol.for('y')]: 2
            };
            let result2 = Reflect.ownKeys(obj2);
            expect(result2).toEqual([Symbol.for('x'),Symbol.for('y')]);

            // 所以Reflect.ownKeys的结果可以看作是
            // Object.getOwnPropertyNames(target)与Object.getOwnPropertySymbols(target)两者的并集；
        });

        it('2-9) Reflect.isExtensible',function() {
            /**
             * 用于判断一个对象是否是可扩展的（该对象是否可以添加新属性），它与Object.isExtensible有些相似，
             * 但对参数不是对象的情况的处理上有不同；
             *
             * Reflect.isExtensible(target)
             * 参数：
             *  target： 用于检测的对象；
             * 返回：
             *  一个boolean值，表示该对象是否可以扩展；
             * 异常：
             *  如果target不是一个对象，会抛出TypeError错误
             * */
            let obj = {};
            let result = Reflect.isExtensible(obj);
            expect(result).toBe(true);

            Reflect.preventExtensions(obj);
            result = Reflect.isExtensible(obj);
            expect(result).toBe(false);

            //Object.seal()：禁止对象添加新属性，同时对象上已存在的属性都变成'non-configurable';
            let sealdObj = Object.seal({});
            result = Reflect.isExtensible(sealdObj);
            expect(result).toBe(false);

            // Reflect.isExtensible与Object.isExtensible不同之处在于，；
            // Reflect.isExtensible会抛出错误；
            expect(function(){
                Reflect.isExtensible(1);
            }).toThrow();
            // 而Object.isExtensible仅返回false
            result = Object.isExtensible(1);
            expect(result).toBe(false);
        });

        it('2-10) Reflect.preventExtensions',function() {
            /**
             * 阻止在目标对象上添加新的属性，与Object.preventExtensions相似；
             * 不同之处在于......
             *
             * Reflect.preventExtensions(target)
             * 参数：
             *  target: 目标对象；
             * 返回：
             *  一个boolean值，表示是否操作成功；
             * 异常：
             *  如果目标不是一个对象，会抛出TypeError错误
             * */
            let target = {a: 1};
            expect(Reflect.isExtensible(target)).toBe(true);

            Reflect.preventExtensions(target);
            expect(Reflect.isExtensible(target)).toBe(false);
            target.b = 2;
            expect(target.b).toBeUndefined();

            // Reflect.preventExtensions与Object.preventExtensions的不同在于对参数不是对象的情况的处理上
            // Reflect.preventExtensions会抛出错误：
            expect(function() {
                Reflect.preventExtensions(1)
            }).toThrow();
            // Object.preventExtensions仅返回当前值
            let r = Object.preventExtensions(1);
            expect(r).toBe(1);
        });

        it('2-11) Reflect.getOwnPropertyDescriptor',function() {
            /**
             * 用于获取给定对象上的某个属性的描述符，与Object.getOwnPropertyDescriptor方法相似，
             * 不同点在于对target参数为非对象的情况的处理；
             *
             * Reflect.getOwnPropertyDescriptor(target,propertyKey)
             * 参数：
             *  target： 目标对象；
             *  propertyKey: 属性名称；
             * 返回：
             *  如果目标对象存在该属性，那么返回该属性的描述符；如果不存在该属性，就返回undefined
             * 异常：
             *  如果目标不是对象，会抛出TypeError
             * */
            let target = {a: 1};
            let result = Reflect.getOwnPropertyDescriptor(target,'a');
            let expectResult = {
                value: 1,
                writable: true,
                enumerable: true,
                configurable: true
            };
            expect(result).toEqual(expectResult);

            result = Reflect.getOwnPropertyDescriptor(target,'x.x');
            expect(result).toBe(undefined);

            // target参数不是对象时，
            // Reflect.getOwnPropertyDescriptor会抛出TypeError错误，
            // Object.getOwnPropertyDescriptor会把target强转为对象;
            expect(function() {
                Reflect.getOwnPropertyDescriptor('hi',0);
            }).toThrow();

            result = Object.getOwnPropertyDescriptor('hi',0);
            expect(result).toEqual({value: 'h',writable: false,enumerable: true,configurable: false});
        });

        it('2-12) Reflect.getPrototypeOf',function() {
            /**
             * 用于获取给定对象的原型对象；与Object.getPrototypeOf方法相似；
             *
             * Reflect.getPrototypeOf(target)
             * 参数：
             *  target： 目标对象；
             * 返回：
             *  给定对象的原型对象，如果该对象没有继承属性，那么返回null
             * 异常：
             *  如果target参数不是对象，会抛出错误；
             * */
            let target = {};
            let targetProto = Reflect.getPrototypeOf(target);
            expect(targetProto).toBe(Object.prototype);

            target = Object.create(null);
            targetProto = Reflect.getPrototypeOf(target);
            expect(targetProto).toBe(null);
        });

        it('2-13) Reflect.setPrototypeOf',function() {
            /**
             * 用于给target对象设置（修改）新的原型对象；与Object.setPrototypeOf方法相同；
             *
             * Reflect.setPrototypeOf(target,prototypeObj)
             * 参数：
             *  target： 目标参数；
             *  prototypeObj: target对象的新原型对象；
             * 返回：
             *  一个boolean值，表示是否设置成功；
             * 异常：
             *  如果参数target不是一个对象、或者prototypeObj参数不是对象、也不是null，会抛出错误；
             * */
            let target = {},
                prototypeObj = Array.prototype,
                result = null;
            result = Reflect.setPrototypeOf(target,prototypeObj);
            expect(result).toBe(true);
            expect(Object.getPrototypeOf(target)).toBe(prototypeObj);
            expect(typeof target.map).toBe('function');

            result = Reflect.setPrototypeOf(target,null);
            expect(result).toBe(true);

            //如果target是不可扩展的对象，那么操作返回false
            let freezeObj = Object.freeze({});
            result = Reflect.setPrototypeOf(freezeObj,{});
            expect(result).toBe(false);

            //如果造成原型链循环的话，也会返回false
            // prototypeObj.__proto__ --> target
            //     ||                       ||
            // prototypeObj <----------- target.__proto__

            // target.__proto__--> prototypeObj
            target = {};
            // prototypeObj.__proto__ --> target
            prototypeObj = Object.create(target);
            // target.__proto__--> prototypeObj
            result = Reflect.setPrototypeOf(target,prototypeObj);
            expect(result).toBe(false);
        });

    })
});