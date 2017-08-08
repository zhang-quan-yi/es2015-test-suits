describe('Day 2: Destructuring(解构)',function(){
    /**
     * ES2015 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为Destructuring (解构)
     * */
    describe('1) 数组的解构赋值（Destructuring）',function(){
        it('1-1) 基本用法',function(){
            let [a,b] = [1,2];
            expect(a).toBe(1);
            expect(b).toBe(2);

            /** 其他情况*/
            let [c,d] = [1];
            expect(c).toBe(1);
            expect(d).toBeUndefined();

        });

        it('1-2) 嵌套赋值',function(){
            let [a, [b ,[c]]] = [1,[2,[3]]];
            expect(a).toBe(1);
            expect(b).toBe(2);
            expect(c).toBe(3);
        });

        it('1-3) 重复声明会有语法错误',function(){
            pending();
            /**
             * 以下会报错： Uncaught SyntaxError： Identifier 'a' has already been declared
             * 语法错误(syntaxError)无法用try...catch...来捕获；
             * */
            // 	let [a] = [1];
            // 	let [a] = [1,2];
        });

        it('1-4) 接受默认值',function(){
            /**
             * 当右边的值是严格等于 '===' undefined，左边的默认值才会生效
             * */

            //默认值生效
            let [a=1,b=1] = [undefined];
            expect(a).toBe(1);
            expect(b).toBe(1);

            //默认值不生效
            let [w=1,x=1,y=1,z=1] = [0,false,'',null];
            expect(w).toBe(0);
            expect(x).toBe(false);
            expect(y).toBe('');
            expect(z).toBe(null);
        });


        it('1-5) 惰性求值',function(){
            /**
             * 如果默认值是一个表达式，那么只有在默认值生效时，才会对该表达式进行求值
             * */

            let exp = jasmine.createSpy().and.returnValue('abc');
            //默认值未生效
            let [c = exp()] = [1];
            expect(c).toBe(1);
            expect(exp).not.toHaveBeenCalled();

            //默认值生效
            let [d = exp()] = [undefined];
            expect(d).toBe('abc');
            expect(exp).toHaveBeenCalled();

        });

        it('1-6) 不可以解构赋值的类型',function(){
            /** 如果等号的右边不是数组（或者严格地说，不是可遍历的结构）,解构赋值失败 */
            expect(
                ()=>{let [foo] = 1;}
            ).toThrowError();

            expect(
                ()=>{let [foo] = false;}
            ).toThrowError();

            expect(
                ()=>{let [foo] = null;}
            ).toThrowError();

            expect(
                ()=>{let [foo] = undefined;}
            ).toThrowError();
        });
    });

    describe('2) 对象的解构赋值(destructuring)',function(){
        it('2-1) 变量名与赋值对象的属性名相同',function(){
            let {a,b} = {a: 1,b: 2};
            expect(a).toBe(1);
        });

        it('2-2) 变量名与赋值对象的属性名不相同',function(){
            let {a: var1,b: var2} = {a: 1,b: 2};
            expect(var1).toBe(1);
        });

        it('2-3) 嵌套赋值',function(){
            let {a: {b: c}} = {a:{b: {value: 1}}};
            expect(c).toEqual({value:1});
        });

        it('2-4) 指定默认值',function(){
            /**
             * 当右边的值是严格等于 '===' undefined ，默认值才会生效
             * */

                //默认值生效；
            let {a=1,b=1} = {a: undefined};
            expect(a).toBe(1);
            expect(b).toBe(1);

            //默认值不生效;
            let {w=1,x=1,y=1,z=1} = {w: 0,x: false,y:null,z: ''};
            expect(w).toBe(0);
            expect(x).toBe(false);
            expect(y).toBe(null);
            expect(z).toBe('');
        });

        it('2-5) 注意：对已经声明的变量解构赋值',function(){
            let x;
            /**
             * 以下会报语法错误(syntaxError)
             * JavaScript 引擎会将{x}理解成一个代码块，从而发生语法错误。
             * */
            //{x} = {x: 1};

            //可以这样写
            ({x} = {x:1});
            expect(x).toBe(1);
        });
    });

    describe('3) 字符串的解构赋值',function(){
        it('3-1) 数组形式',function(){
            let [a,b] = 'qy';
            expect(a).toBe('q');
            expect(b).toBe('y');
        });

        it('3-2) 对象形式',function(){
            let {length} = 'qy';
            expect(length).toBe(2);
        });

    });

    describe('4) 数值和布尔值的解构赋值',function(){
        it('4-1) 先将数值或布尔值转换为包装对象',function(){
            let {toFixed} = 123;
            expect(toFixed).toBe(Number.prototype.toFixed);

            let {toString} = false;
            expect(toString).toBe(Boolean.prototype.toString);
        });
    });

    describe('5) 函数参数的解构赋值',function(){
        it('5-1) 基本用法',function(){
            //demo1
            let result,
                f1 = function({x,y}){return x+y};

            result = f1({x:1,y:2});
            expect(result).toBe(3);

            //demo2: 默认值
            let f2 = function({x=0,y=0}){return x+y};
            result = f2({x:1});
            expect(result).toBe(1);
        });
    });
});