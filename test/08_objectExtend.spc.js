describe('Day 8: 对象的扩展',function() {
    describe('1) 属性的简单表示',function() {
        it('1-1) 属性简写',function() {
            var a = 1,
                b=2,
                foo = {a,b},
                foo2 = {a:a,b:b};
            //foo 等价于 foo2
            expect(foo).toEqual(foo2);
        });

        it('1-2) 函数方法简写',function() {
            var foo = {
                    a (){}
                },
                foo2 = {
                    a:  foo.a
                };
            expect(foo).toEqual(foo2);
        });

        it('1-3) 属性的赋值器（setter）和取值器（getter）写法',function() {
            var foo = {
                _a: 1,
                get a(){
                    return this._a;
                },
                set a(value){
                    this._a = value;
                }
            };
            expect(foo.a).toBe(1);
            foo.a = 2;
            expect(foo.a).toBe(2);
        });
    });

    describe('2) 属性名表达式',function() {
        it('2-1) 使用字面量定义对象时，属性名可以是表达式',function() {
            var pp = 'qy';
            var foo = {
                [pp]: 1,
                ['a'+'b']:2
            };
            expect(foo[pp]).toBe(foo['qy']);
            expect(foo[pp]).toBe(1);

            expect(foo['ab']).toBe(2);

        });
        
        it('2-2) 使用字面量定义对象时，方法属性名可以是表达式',function() {
            var pp = 'qy';
            var foo = {
              [pp](){return 'qy'}
            };

            expect(foo.qy()).toBe('qy');
        });

        it('2-3) 属性名表达式是一个对象',function(){
            /**
             * 作为属性名的对象a会被转化为'[object Object]'字符串
             * */
            var a = {x:1};
            var foo = {
                [a]: 'qy'
            };
            expect(foo['[object Object]']).toBe('qy');
        });
    });

    describe('3) 方法的name属性',function() {
        it('3-1) 对象方法的name属性',function() {
            /**
             * 对象方法的name属性返回属性名
             * */
            var foo = {
                hi(){}
            };
            expect(foo.hi.name).toBe('hi');
        });

        it('3-2) 属性的赋值器（setter）和取值器（getter）的name属性',function() {
            var foo = {
                get a(){},
                set a(vaule){}
            };

            var descriptor = Object.getOwnPropertyDescriptor(foo,'a');
            var get = descriptor.get;
            var set = descriptor.set;
            /**
             * name属性返回值为get+属性名
             * */
            expect(get.name).toBe('get a');
            expect(set.name).toBe('set a');
        });

        it('3-3) bind方法生成的函数',function(){
            var foo = function(){};
            var bindFoo = foo.bind({});
            /**
             * name属性返回值为get+函数名
             * */
            expect(bindFoo.name).toBe('bound foo');

            var bindFn = (new Function()).bind().name;
            expect(bindFn).toBe('bound anonymous');
        });
    });

    describe('4) Object构造函数的静态方法',function() {
        it('4-1) Object.is',function(){
            /**
             * 它用来比较两个值是否严格相等，与严格比较运算符（===）的行为基本一致。
             * 有以下两个不同之处：
             * */
            // 第一处
            expect(0===-0).toBe(true);
            expect(Object.is(+0,-0)).toBe(false);

            // 第二处
            expect(NaN===NaN).toBe(false);
            expect(Object.is(NaN,NaN)).toBe(true);

            // 示例讲解
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness

            var foo = {};
            //添加一个不可更改的属性NEGATIVE_ZERO
            Object.defineProperty(foo,'NEGATIVE_ZERO',{
                value: -0,
                writable: false,
                configurable: false,
                enumerable: false
            });
            var change = function(v) {
                Object.defineProperty(foo,'NEGATIVE_ZERO',{
                    value: v
                });
            };
            //如果执行change(-0)，因为值没有变化，并不会执行覆盖操作
            expect(function() {
                change(-0);
            }).not.toThrowError();
            //如果执行change(0),值发生了变化，执行覆盖操作，但会报错
            expect(function() {
                change(0);
            }).toThrowError('Cannot redefine property: NEGATIVE_ZERO');
            
            //当重新定义不可修改的属性，新的值和旧值的比较就是Object.is操作实现的；
        });
        
        describe('4-2) Object.assign',function() {
            /**
             * Object.assign(target,...src)
             * 用于对象的合并，将src对象的属性复制到target上，如有同名属性，target对象的属性将会被覆盖
             * */
            it('4-2-1) 基本用法',function() {
                var s1 = {a:1,},
                    s2 = {b:2},
                    t = {};
                Object.assign(t,s1,s2);
                expect(t).toEqual({a:1,b:2});
            });

            it('4-2-2) 覆盖target上的同名属性',function(){
                var s = {x:'src'},
                    t = {x: 'target'};
                Object.assign(t,s);
                expect(t).toEqual({x: 'src'});

                //如果有多个同名属性，那么采用靠后的一个
                var s1 = {x: 1},
                    s2 = {x:2};
                Object.assign(t,s1,s2);
                expect(t).toEqual({x:2});
            });

            it('4-2-3) 只复制source对象上可枚举的属性（enumerable）',function() {
                var s = {},t = {};
                //不可枚举
                Object.defineProperty(s,'a',{
                    value: 1,
                    enumerable: false
                });
                //可枚举
                Object.defineProperty(s,'b',{
                    value: 2,
                    enumerable: true
                });
                Object.assign(t,s);
                expect(t).toEqual({b:2});
            });

            it('4-2-4) 只复制source对象自身拥有的属性',function() {
                var Foo = function() {
                    this.a = 1;
                };
                Foo.prototype.b = 2;

                var s = new Foo(),
                    t = {};
                Object.assign(t,s);
                expect(t).toEqual({a: 1});
                expect(t.b).toBeUndefined();
            });

            it('4-2-5) 会使用source对象上的[get]和target对象上的[set]',function() {
                var s = {},
                    t = {},
                    spy = jasmine.createSpy().and.returnValue(1);
                Object.defineProperty(s,'a',{
                    get: spy,
                    enumerable: true
                });
                Object.assign(t,s);

                expect(spy).toHaveBeenCalled();

                var setSpy = jasmine.createSpy();
                Object.defineProperty(t,'a',{
                    set: setSpy
                });
                Object.assign(t,s);
                expect(setSpy).toHaveBeenCalledWith(1);
            });

            it('4-2-6) source是字符串的时候会遍历字符串，拷贝键值对',function() {
                var s = 'abc',
                    t = {};
                Object.assign(t,s);
                expect(t).toEqual({0:'a',1:'b',2: 'c'});
            });

            it('4-2-7) 实行的是浅拷贝',function(){
                var s = {a: {a: 1}},
                    t = {};
                Object.assign(t,s);
                expect(t.a === s.a).toBe(true);
            });
            
        });

        
    });

    describe('5) __proto__属性',function() {
        /**
         * 用来读取或设置当前对象的prototype对象。目前，所有浏览器（包括 IE11）都部署了这个属性。
         * 只有浏览器必须部署这个属性，其他运行环境不一定需要部署，而且新的代码最好认为这个属性是不存在的。
         * 无论从语义的角度，还是从兼容性的角度，都不要使用这个属性，而是使用下面的:
         * Object.setPrototypeOf（写操作）
         * Object.getPrototypeOf（读操作）
         * Object.create（新建）
         * */
        it('5-1) 设置: Object,.setPrototypeOf',function() {
            var foo = {},
                pp = {a:1};
            Object.setPrototypeOf(foo,pp);
            expect(foo.a).toBe(1);
            expect(foo.hasOwnProperty('pp')).toBe(false);
        });

        it('5-2) 读取: Object.getPrototypeOf',function() {
            var Foo = function(){},
                pp = {a:1};
            Foo.prototype = pp;

            var foo = new Foo();
            var fooPP = Object.getPrototypeOf(foo);
            expect(fooPP === pp).toBe(true);
        });

        it('5-3) 新建: Object.create',function() {
            var pp = {a:1};
            var foo = Object.create(pp);

            var fooPP = Object.getPrototypeOf(foo);
            expect(fooPP===pp).toBe(true);
        });
    });
});