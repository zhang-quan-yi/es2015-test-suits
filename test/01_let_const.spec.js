describe('Day 1',function(){
    describe('1) let',function(){
        it('1-1) 支持区域作用域(block scope)',function(){
            {
                let a = 1;
                expect(a).toBe(1);
            }
            expect(typeof a).toBe('undefined');
        });

        it('1-2) 不支持变量提升',function(){
            {
                expect(function(){
                    typeof a;
                }).toThrowError('a is not defined');

                let a = 2;
            }
            // let不支持变量提升，在let命令声明变量之前，该变量都是不可用的，即使是typeof操作符也不安全

            // var 关键字就没问题；
            {
                expect(typeof b).toBe('undefined');
                var b;
            }

        });

        it('1-3) 不允许重复声明',function() {
            // let a;
            // let a;
            // 以上操作会引发语法错误，js将无法执行。。。
        });

        it('1-4）块级作用域中的函数声明',function() {
            pending('not finish yet');
            /**
             * 在浏览器中：
             *  允许在块级作用域内声明函数。
             *  函数声明类似于var，即会提升到全局作用域或函数作用域的头部。
             *  同时，函数声明还会提升到所在的块级作用域的头部。
             * */
        });
    });

    describe('2) const',function(){
        it('2-1) 赋值之后不能重新赋值',function(){
            const PI = 3.14;
            expect(function(){
                //noinspection JSAnnotator
                PI = 0;
            }).toThrowError('Assignment to constant variable.');

            // 并且通过const 关键字声明常量时，必须为常量赋值；
            // 以下会出现 语法错误
            // const a;
        });

        it('2-2) 支持区域作用域(block scope)',function(){
            {
                const PI = 3.14;
            }
            expect(typeof PI).toBe('undefined');
        });

    });

    describe('3) 顶层对象属性',function(){
        it('3-1) 全局变量逐步与顶层对象属性脱离',function(){
            /**
             * 不声明变量a，直接给a赋值，这样是可以实现变量a挂在window上
             * */
            a = 1;
            let b = 1;
            expect(window.a).toBe(1);
            expect(window.b).toBeUndefined();
        });
    });
});