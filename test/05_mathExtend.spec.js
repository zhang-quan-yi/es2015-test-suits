describe('Day 5:number',function(){
    describe('1) 二进制和八进制表示法',function(){
        it('1-1) 二进制表示法:0b',function(){
            expect(0b1001).toBe(9);
        });

        it('1-2) 八进制表示法:0o',function(){
            expect(0o11).toBe(9);
        });

        it('1-3) 将二进制和八进制转化为十进制',function(){
            var num = Number('0o11');
            expect(num).toBe(9);
        });
    });

    describe('2) Number构造函数新加的静态方法',function(){
        it('2-1) Number.isFinite',function(){
            /**
             * 检查一个数值是否为有限的
             * */
            expect(Number.isFinite(1)).toBe(true);
            expect(Number.isFinite(Infinity)).toBe(false);
            expect(Number.isFinite(-Infinity)).toBe(false);
            expect(Number.isFinite('qy')).toBe(false);
        });

        it('2-2) Number.isNaN',function(){
            /**
             * 用来检查一个值是否为NaN
             * */
            expect(Number.isNaN(1)).toBe(false);
            expect(Number.isNaN(1*'a')).toBe(true);
        });

        it('2-3) Number.parseInt和Number.parseFloat',function(){
            /**
             * ES2015 将全局方法parseInt()和parseFloat()
             * 移植到Number对象上面，行为完全保持不变。
             * */
            expect(Number.parseInt).toBe(parseInt);
            expect(Number.parseFloat).toBe(parseFloat);
        });

        it('2-4) Number.isInteger',function(){
            /**
             * 判断一个值是否为整数
             * */
            expect(Number.isInteger(1)).toBe(true);
            expect(Number.isInteger(1.0)).toBe(true);//注：在 JavaScript 内部，整数和浮点数是同样的储存方法；
            expect(Number.isInteger(1.1)).toBe(false);
        });

        it('2-5) Number.EPSILON',function(){
            /**
             * 这是新增一个极小的常量
             * */
            expect(Number.EPSILON).toBe(2.220446049250313e-16);
            expect(Number.EPSILON.toFixed(20)).toBe('0.00000000000000022204');

            /**
             * Number.EPSILON 实质是一个可以接受的误差范围:
             * 可以用来做误差检测
             * */
            // 由于浮点数的生成方式，浮点数是无法精确比较的；
            expect(0.1+0.2===0.3).toBe(false);
            // 所以只能在可接受误差范围内判断浮点数是否相等；
            let equalWithInError = function(left,right){
                return Math.abs(left - right) < Number.EPSILON;
            };
            expect(equalWithInError(0.1+0.2,0.3)).toBe(true);
        });

        it('2-6) Number.isSafeInteger、Number.MAX_SAFE_INTEGER和Number.MIN_SAFE_INTEGER',function(){
            /**
             * JavaScript能够准确表示的整数范围在 -2^53 到 2^53之间（不含两个端点）;
             *
             * Number.isSafeInteger:
             * 用来判断一个整数是否落在这个范围之内
             *
             * Number.MAX_SAFE_INTEGER： 9007199254740991(2^53-1)
             * Number.MIN_SAFE_INTEGER：-9007199254740991(-2^53+1)
             * 这两个常量，用来表示这个范围的上下限
             * */
            let maxSafeNumber = Math.pow(2,53)-1;

            // 超过这个范围，无法精确表示这个值。
            let unsafeNumber = maxSafeNumber+1;//9007199254740992
            expect(9007199254740993).toBe(9007199254740992);
            //超过9007199254740992，js已经不精确了；
        });
    });

    describe('3) Math构造函数的静态方法',function(){
        it('3-1) Math.trunc',function(){
            /**
             * 去除一个数的小数部分，返回整数部分
             * */
            expect(Math.trunc(1.002)).toBe(1);
            expect(Math.trunc('123.456')).toBe(123);
            expect(Math.trunc('qy')).toBeNaN();
        });

        it('3-2) Math.sign',function(){
            /**
             * 一个数到底是正数、负数、还是零。
             * 正数返回 1
             * 负数返回 -1
             * 零返回 0
             * */

            expect(Math.sign(5)).toBe(1);
            expect(Math.sign(-5)).toBe(-1);
            expect(Math.sign(0)).toBe(0);
            expect(Math.sign(-0)).toBe(0);

        });

        it('3-3) Math.cbrt',function(){
            /**
             * 计算立方根
             * */
            expect(Math.cbrt(8)).toBe(2);
        });

        it('3-4) Math.clz32',function(){
            /**
             * Math.clz32方法返回一个数的32位无符号整数形式有多少个前导 0
             * */
            expect(Math.clz32(0)).toBe(32);
            expect(Math.clz32(1)).toBe(31);
            expect(Math.clz32(1<<1)).toBe(30);
        });

        it('3-5) Math.imul',function(){
            /**
             * 该方法返回两个数以32位带符号整数形式相乘的结果，返回值也是一个32位的带符号整数。
             * 该方法可以返回正确的低位数值。
             * */

            expect(Math.imul(2,4)).toBe(8);
            expect(Math.imul(-2,4)).toBe(-8);

            /**
             * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
             *
             * Polyfill:
             * */
            Math.imul = Math.imul || function(a, b) {
                    var ah = (a >>> 16) & 0xffff;
                    var al = a & 0xffff;
                    var bh = (b >>> 16) & 0xffff;
                    var bl = b & 0xffff;
                    // the shift by 0 fixes the sign on the high part
                    // the final |0 converts the unsigned value into a signed value
                    return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
                };
            /**
             * 很大的数相乘后，如果值超过2的53次方，那么低位数值往往都是不精确的，
             * 所以Math.imul 方法在return 后面的表达式里省略了 ah*bh<<32 这一项，也就是高位数值的相乘结果，
             * 以此来保证低位的精度；
             * */
        });

        it('3-6) Math.fround',function(){
            /**
             * Math.fround(number)
             *  返回一个与给定数值接近的单精度浮点数；
             * */
            expect(Math.fround(1)).toBe(1);
            expect(Math.fround(1.337)).toBe(1.3370000123977661);
            pending();

        });

        it('3-7) Math.hypot',function(){
            /**
             * 返回所有参数的平方和的平方根
             * */
            expect(Math.hypot(3,4)).toBe(5);
        });

        describe('3-8) 对数方法',function(){
            it('3-8-1) Math.expm1',function(){
                /**
                 * Math.expm1 返回 e^x -1
                 * */
                expect(Math.expm1(3)).toBe(Math.exp(3)-1);//即 e^3 -1 ;
            });

            it('3-8-2) Math.log1p',function(){
                /**
                 * Math.log1p(x)方法返回1 + x的自然对数
                 * */
                expect(Math.log1p(3)).toBe(Math.log(1+3));//即x+1的自然对数：log e (x+1)
            });

            it('3-8-3) Math.log10',function(){
                /**
                 * Math.log10(x)返回以10为底的x的对数
                 */
                expect(Math.log10(100)).toBe(2);
            });

            it('3-8-4) Math.log2',function(){
                /**
                 * Math.log2返回以2位底的对数；
                 * */
                expect(Math.log2(4)).toBe(2);
            });
        });

        it('3-9) 指数运算符 ** ',function(){
            expect(2**3).toBe(8);
        });

        it('3-10) Math.signbit',function(){
            /**
             * Math.sign()用来判断一个值的正负
             * 但是如果参数是-0，它会返回-0。
             * */
            //expect(Math.signbit(-0)).toBe(true);
            pending('暂未实现');
        });

        describe('3-11) 新增了6个三角函数方法',function(){
            it('Math.sinh');
            it('Math.cosh');
            it('Math.tanh');
            it('Math.asinh');
            it('Math.acosh');
            it('Math.atanh');
        });

    });
});