describe('Day 19: 基于extends 关键字的class 继承', function() {
    describe('1) 属性方法的继承', function() {
        it('1-1) 示例', function() {
            class Animal {
                speak() {
                    return 'makes a noise';
                }
            }

            class Cat extends Animal {
            }

            let cat = new Cat();
            expect(typeof cat.speak).toBe('function');

            // Cat 继承了 Animal 的speak 方法,cat 实例拥有speak方法
            expect(cat.speak).toBe(Animal.prototype.speak);

            // cat 实例引用 speak 方法的方式
            expect(cat.__proto__.__proto__.speak).toBe(Animal.prototype.speak);

        });

        it('1-2) 示例: es5 实现方式', function() {
            function Animal() {
            }

            Animal.prototype.speak = function() {
                return 'make a noise';
            };

            function Cat() {
            }

            // 类 o只是一个临时类；它拥有Animal的原型对象；
            function o() {
            }

            o.prototype = Animal.prototype;

            Cat.prototype = new o();

            let cat = new Cat();
            expect(typeof cat.speak).toBe('function');
            expect(cat.__proto__.__proto__.speak).toBe(Animal.prototype.speak);
            console.log(cat);
        });

        it('1-3) 继承基于函数的"类"', function() {
            function Animal() {
            }

            Animal.prototype.speak = function() {
                return 'make a noise';
            };

            class Cat extends Animal {
            }

            let cat = new Cat();
            expect(typeof cat.speak).toBe('function');
        });
    });

    describe('2) 静态方法的继承',function() {
        it('2-1) 示例',function() {
            class Animal{
                static getType(){
                    return 'animal';
                }
            }

            class Cat extends Animal{}

            expect(Cat.getType()).toBe('animal');

            // Cat.getType 方法的引用方式
            expect(Cat.__proto__.speak).toBe(Animal.speak);
            expect(Cat.__proto__).toBe(Animal);
        });

        it('2-2) 示例：es5实现方式',function() {
            function Animal(){}
            Animal.getType = function() {
                return 'animal';
            };

            function Cat(){}
            Object.setPrototypeOf(Cat,Animal);// 等同于 Cat.__proto__ = Animal;

            expect(Cat.getType()).toBe('animal');
        });
    });

    describe('3) 子类构造函数中的super() 方法', function() {
        it('3-1) 用于调用父类构造函数', function() {
            class Animal {
                constructor() {
                    this.superClass = 'Animal';
                    this.who = 'animal';
                    this.word = '';
                }

                speak() {
                    return this.who + " " + this.word;
                }
            }

            class Cat extends Animal {
                constructor() {
                    super();
                    this.who = 'cat';
                    this.word = '喵～';
                }
            }

            let cat = new Cat();
            expect(cat.superClass).toBe('Animal');
            expect(cat.speak()).toBe('cat 喵～');
        });

        it('3-2) 如果子类声明了构造函数，那么在构造函数中必须先调用super() 方法才能使用this 对象；', function() {
            class Father {
                constructor() {
                    this.superClass = 'Father';
                }
            }

            expect(function() {
                class Child extends Father {
                    constructor() {
                        this.who = ''
                    }
                }

                let child = new Child();

            }).toThrowError("Must call super constructor in derived class before accessing 'this' or returning from derived constructor");
        });
    });

    describe('4) super 对象', function() {
        it('4-1) 用于在子类成员方法中调用父类成员方法', function() {
            class Animal {
                speak() {
                    return 'animal ';
                }
            }

            class Cat extends Animal {
                speak() {
                    return super.speak() + 'cat';
                }
            }

            let cat = new Cat();
            expect(cat.speak()).toBe('animal cat');

        });

        it('4-2) 父类方法中的this 指向', function() {
            class Animal {
                constructor() {
                    this.who = 'animal';
                }

                speak() {
                    return this.who;
                }
            }

            class Cat extends Animal {
                constructor() {
                    super();
                    this.who = 'cat';
                }

                speak() {
                    /**
                     * super.speak 方法中的this 指向Cat实例
                     * */
                    return super.speak()
                }
            }

            let cat = new Cat();
            expect(cat.speak()).toBe('cat');
        });

        it('4-3) 用于在子类静态方法中调用父类的静态方法', function() {
            class Animal {
                static getType() {
                    return 'animal';
                }
            }

            class Cat extends Animal {
                static getType() {
                    return super.getType();
                }
            }

            expect(Cat.getType()).toBe('animal');
        });
    });

    describe('5) Object.getPrototypeOf() 方法', function() {
        it('5-1) 用于获取子类的父类', function() {
            class Animal {
            }
            class Cat extends Animal {
            }

            let s;
            s = Object.getPrototypeOf(Cat);
            expect(s).toBe(Animal);
        });
    });

    describe('6) Species: 覆盖衍生对象的默认构造函数',function() {
        it('6-1) 修改map函数返回对象的构造函数',function() {
            class MyArray1 extends Array {}

            let myArray1 = new MyArray1();
            let map1 = myArray1.map(x=>x);
            // 正常情况下，map1 是MyArray1 的实例；
            expect(map1 instanceof MyArray1).toBe(true);
            expect(map1 instanceof Array).toBe(true);

            // 修改map函数返回对象的构造函数
            class MyArray2 extends Array{
                static get [Symbol.species](){
                    return Array;
                }
            }
            let myArray2 = new MyArray2();
            let map2 = myArray2.map(x=>x);
            // 现在map2 仅仅是Array的实例了；
            expect(map2 instanceof MyArray2).toBe(false);
            expect(map2 instanceof Array).toBe(true);

        });
    });

    describe('7) Mix-ins',function() {
        /**
         * class 的继承只允许有一个父类，不支持继承多个父类；
         * Mix-ins可以将多个接口"混入"到另一个class 中；
         * */
        it('7-1) 基本实现',function() {
            // 下面方法会返回一个有着add 方法的基类；
            let calculatorMixin = function(Base){
                class SubClass extends Base{
                    add(x,y){
                        return x+y;
                    }
                }
                return SubClass;
            };

            // 下面方法会返回一个有着randomize 方法的基类
            let randomizerMixin = function(Base){
                class SubClass extends Base {
                    randomize(){
                        return Math.random();
                    }
                }
                return SubClass;
            };

            class Foo{}
            class Bar extends calculatorMixin(randomizerMixin(Foo)){}

            // Bar 子类同时继承了randomize 方法和add 方法
            let bar = new Bar();
            expect(typeof bar.add).toBe('function');
            expect(typeof bar.randomize).toBe('function');

        });
    });
});