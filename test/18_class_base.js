describe('Day 18: class 基本语法', function() {
    /**
     * 新添加的class 关键词是基于现有的Javascript 原型链继承语法封装的（语法糖），class 语法并没有引入新的面向对象机制；
     * 但是class 语法提供了更加简单、清晰的语法来处理对象的创建和继承；
     * */
    describe('1) 基本语法', function() {
        it('1-1) 示例', function() {
            // 申明一个类，
            // 拥有一个属性 a
            // 拥有一个方法 sayHi
            class Foo {
                constructor(num) {
                    this.a = num;
                }

                sayHi() {
                    return 'hi'
                }
            }
            let foo = new Foo(1);

            expect(foo.a).toBe(1);
            expect(foo.sayHi()).toBe('hi');


        });

        it('1-2) constructor 方法',function() {
            /**
             * constructor 方法是一个特殊的方法，用来创建并且初始化特定类的实例；
             * 通过new 操作符生成对象实例时，会自动调用该方法；
             * constructor 方法在类定义中只能有一个；
             * */
            let isCalled = false;
            class Foo{
                constructor(){
                    isCalled = true;
                }
            }

            let foo = new Foo();
            expect(isCalled).toBe(true);

            // 如果没有显示定义，那么会生成一个空的contructor方法
            class Bar{}
            let bar = new Bar();
            expect(typeof bar.constructor).toBe('function');
            // 等价于
            // class Bar{
            //     constructor(){}
            // }
        });

        it('1-3) 两种声明类的方式', function() {
            // 类 表达式
            let Foo1 = class {
                constructor(num) {
                    this.a = num;
                }
            };

            // 类 申明
            class Foo2 {
                constructor(num) {
                    this.a = num;
                }
            }
        });

        it('1-4) 类的表达式声明方式',function() {
            let Foo = class Me {};
            // 上面，声明的类的名称叫 Foo,不是Me；
            expect(typeof Me ).toBe('undefined');
        });
    });

    describe('2) class 语法与原型链语法', function() {
        it('2-1) 直观比较',function() {
            // class 语法
            class Foo1 {
                constructor(num) {
                    this.a = num;
                }

                sayHi() {
                    return 'hi';
                }
            }
            let foo1 = new Foo1(1);
            expect(foo1.a).toBe(1);
            expect(foo1.sayHi()).toBe('hi');

            // 原型语法
            function Foo2(num) {
                this.a = num;
            }

            Foo2.prototype.sayHi = function() {
                return 'hi';
            };
            let foo2 = new Foo2(2);
            expect(foo2.a).toBe(2);
            expect(foo2.sayHi()).toBe('hi');
        });

        it('2-2) class 声明的类本质是函数', function() {
            class Foo{}
            expect(typeof Foo).toBe('function');
        });

        it('2-3) 类内部的方法是定义在prototype属性上的',function() {
            class Foo{
                constructor(){}
                sayHi(){return 'hi';}
            }

            expect(typeof Foo.prototype.constructor).toBe('function');
            expect(Foo.prototype.sayHi()).toBe('hi');

            let foo = new Foo();
            expect(foo.constructor).toBe(Foo.prototype.constructor);
            expect(foo.sayHi).toBe(Foo.prototype.sayHi);
        });

        it('2-4) 类内部的方法是不可枚举的',function() {
            class Foo{
                constructor(num){
                    this.a = num;
                }
                sayHi(){
                    return 'hi';
                }
            }
            let foo = new Foo(1);
            expect(Object.keys(foo)).toEqual(['a']);

            // 通过Object.keys 获取的foo 的属性中没有 sayHi方法
        });
    });

    describe('3) 进阶',function() {
        it('3-1) 类声明不会提升',function() {
            // 先引用（使用）类，之后再定义类，会出现ReferenceError错误
            expect(function() {
                let foo = new Foo();
            }).toThrow();

            class Foo{}

            // 相对而言，函数的声明会提升：可以先引用函数，再定义  !_!
            expect(foo2()).toBe('foo2');

            function foo2(){return 'foo2';}
        });

        it('3-2) 类的内部运行在严格模式下',function() {
            let Foo = class {
                sayThis(){
                    return this;
                }
            };

            let sayThis;
            sayThis = function(){
                return this;
            };
            expect(sayThis()).toBe(global);

            sayThis = Foo.prototype.sayThis;
            expect(sayThis()).toBe(undefined);

            /**
             * 正常情况下，一个函数内部的this 指向函数执行时的上下文，
             * 如果函数是直接调用（并不是作为一个对象的属性调用）那么this会指向全局对象，
             * 而在严格模式下，直接调用一个函数，函数内部的this会指向 undefined
             * */
        });

        it('3-3) static methods',function() {
            /**
             * static 关键字为类定义了 static method
             * static method 不需要实例化就可以调用，
             * static method 是属于类的，不属于类的实例，也就是说不可以通过实例来调用static method
             * */
            class Foo{
                static fooFactory (){
                    // 用来创建Foo 实例
                    return new this;
                }

                sayHi(){
                    return 'hi';
                }
            }
            let foo = Foo.fooFactory();

            expect(typeof Foo.fooFactory).toBe('function');
            expect(typeof Foo.sayHi).toBe('undefined');
            expect(typeof foo.fooFactory).toBe('undefined');
            expect(typeof foo.sayHi).toBe('function');
        });

        it('3-4) getter、setter 访问器',function() {
            /**
             * 与 ES5 一样，在class 的内部可以使用get 和set 关键字，
             * 对某个属性设置存值函数和取值函数，拦截该属性的存取行为。
             * */

            // 实例： 通过模块实现类的私有属性
            function myModule(){
                let privateProperty = null;

                class Foo {
                    get prop(){
                        return privateProperty;
                    }
                    set prop(value){
                        privateProperty = value;
                        if(value<0){
                            privateProperty = 0;
                        }
                    }
                }

                return Foo;
            }

            let Foo = myModule();
            let foo = new Foo();
            foo.prop = -1;
            expect(foo.prop).toBe(0);
        });

        it('3-5) new.target 属性',function() {
            /**
             * 该属性一般用在在constructor 函数之中，返回new 命令作用于的那个constructor 函数；
             * 如果不是通过new 操作符调用constructor 函数，那么new.target 属性值为undefined；
             * 因此可以通过这个属性来判断constructor 函数是否通过new 命令调用。
             * */
            function Foo(){
                if(!new.target){
                    return new Foo();
                }
                this.a = 1;
            }

            let foo1 = new Foo();
            expect(foo1.a).toBe(1);

            let foo2 = Foo();
            expect(foo2.a).toBe(1);
        });
    });
});