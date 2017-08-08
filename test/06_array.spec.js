describe('Day 6:array',function(){
    describe('1) Array构造函数的静态方法',function(){
        it('1-1) Array.from',function(){
            /**
             * 将两类对象转为真正的数组：
             * 类似数组的对象（array-like object）和可遍历（iterable）的对象
             * 语法：
             * Array.from(arrayLikeObj,[mapFn,[thisArg]]);
             * */

            var arrLike = {
                0: 'a',
                1: 'b',
                length: 2
            };

            var arr = Array.from(arrLike);
            expect(arr).toEqual(['a','b']);

            arr = Array.from(arrLike,function(item,index){
                return item+'-'+index;
            });
            expect(arr).toEqual(['a-0','b-1']);

            arr = Array.from(arrLike,function(item,index){return this.prefix+'-'+index},{prefix: 'qy'})
            expect(arr).toEqual(['qy-0','qy-1']);



            // 常见的类似数组的对象是DOM操作返回的NodeList集合，以及函数内部的arguments对象
        });

        it('1-2) Array.of',function(){
            /**
             * 将一组值，转换为数组
             * */
            var arr = Array.of(3,4,5);
            expect(arr).toEqual([3,4,5]);
        });
    });

    describe('2) 数组实例方法',function(){
        it('2-1) arr.copyWithin',function(){
            /**
             * 将一个数组的一部分（浅）复制到该数组的其他位置，并返回该数组，该方法不改变数组的长度；
             * 语法：
             *  arr.copyWithin(target)
             *  arr.copyWithin(target,start)
             *  arr.copyWithin(target,start,end)
             *
             * 参数：
             *  target[Number]: 以0为起始位置，指定从什么位置开始以复制的内容替换该位置内容；如果为负数，那么从末位位置开始算；
             *  start[Number](可选): 以0为起始位置，指定复制内容的起始位置；如果为负数，那么从末位位置开始算；如果省略，则从位置0开始；
             *  end[Number](可选): 以0为起始位置，指定复制内容的结束位置；如果为负数，那么从末位位置开始算；如果省略，则到结尾为止；
             * */
            var arr1 = [0,1,2,3,4,5,6,7,8,9];
            arr1.copyWithin(1,7,9);
            expect(arr1).toEqual([0,7,8,3,4,5,6,7,8,9]);

            var arr2 = [0,1,2,3,4,5,6,7,8,9];
            arr2.copyWithin(1,7);
            expect(arr2).toEqual([0,7,8,9,4,5,6,7,8,9]);

            var arr3 = [0,1,2,3,4,5,6,7,8,9];
            arr3.copyWithin(1);
            expect(arr3).toEqual([0,0,1,2,3,4,5,6,7,8]);

            var arr4 = [0,1,2,3,4,5,6,7,8,9];
            arr4.copyWithin(1,-3,-1);
            expect(arr4).toEqual([0,7,8,3,4,5,6,7,8,9]);
        });

        it('2-2) arr.find',function(){
            /**
             * 用于找出第一个符合条件的数组成员。
             * 语法：
             *  find (filterFn)
             *
             * 返回：
             *  第一个符合条件的成员,否则返回undefined
             * */
            var r;
            r = ['a1','b2','c3','d4','e5'].find(function(item,index,arr){
                return item.charAt(0) ==='d';
            });
            expect(r).toBe('d4');

            r = ['a1','b2','c3','d4','e5'].find(function(item,index,arr){
                return item.charAt(0) ==='x.x';
            });
            expect(r).toBeUndefined();

        });

        it('2-3) arr.findIndex',function(){
            /**
             * 第一个符合条件的数组成员的位置
             * 语法：
             *  findIndex(filterFn)
             *
             * 返回：
             *  一个符合条件的成员下标，否则返回-1；
             * */
            var r;
            r = ['a1','b2','c3','d4','e5'].findIndex(function(item,index,arr){
                return item.charAt(0) === 'd';
            });
            expect(r).toBe(3);

            r = ['a1','b2','c3','d4','e5'].findIndex(function(item,index,arr){
                return item.charAt(0) === 'x.x';
            });
            expect(r).toBe(-1);
        });

        it('2-4) arr.fill',function(){
            /**
             * 使用给定值，填充一个数组
             *
             * 语法：
             *  arr.fill(value)
             *  arr.fill(value,start)
             *  arr.fill(value,start,end)
             *
             * 参数：
             *  value: 需要填充的值；
             *  start: 起始下标，默认为0；
             *  end: 结束下标，默认为最后一个下标；
             * */
            var arr = new Array(3);
            arr.fill('x.x');
            expect(arr).toEqual(['x.x','x.x','x.x']);

            arr = [0,1,2,3,4,5,6];
            arr.fill('x.x',4);
            expect(arr).toEqual([0,1,2,3,'x.x','x.x','x.x']);

            arr = [0,1,2,3,4,5,6];
            arr.fill('x.x',4,5);
            expect(arr).toEqual([0,1,2,3,'x.x',5,6]);
        });

        it('2-5) arr.entries',function() {
            /**
             * 返回一个新的数组遍历器对象，该对象包含了arr的键值对
             * */
            var arr = ['a','b','c'];
            var iterator = arr.entries();
            var r = [];

            expect(iterator.next()).toEqual({value: [0,'a'],done: false});
            expect(iterator.next()).toEqual({value: [1,'b'],done: false});
            expect(iterator.next()).toEqual({value: [2,'c'],done: false});
            expect(iterator.next()).toEqual({value: undefined,done: true});
            expect(iterator.next()).toEqual({value: undefined,done: true});

            //遍历器(iterator)也可以通过for...of...来遍历
            iterator = arr.entries();
            for(let item of iterator){
                r.push(item);
            }
            expect(r).toEqual([[0,'a'],[1,'b'],[2,'c']]);
        });

        it('2-6) arr.keys',function() {
            /**
             * 返回一个新的数组遍历器对象,该对象包含arr的键值；
             * */
            var arr = ['a','b'];
            var iterator = arr.keys();
            expect(iterator.next()).toEqual({value: 0,done: false});
            expect(iterator.next()).toEqual({value: 1,done: false});
            expect(iterator.next()).toEqual({value: undefined,done: true});
            expect(iterator.next()).toEqual({value: undefined,done: true});

            //遍历器(iterator)也可以通过for...of...来遍历
            let r = [];
            iterator = arr.keys();
            for(let key of iterator){
                r.push(key);
            }
            expect(r).toEqual([0,1]);
        });

        it('2-7) arr.values',function() {
            /**
             * 返回一个新的数组遍历器对象,该对象包含arr的成员值；
             * */

            var arr = ['a','b'];
            var isSupport = !!arr.values;
            if(!isSupport){
                pending('暂未实现');
                return;
            }

            var arr = ['a','b'];

            var iterator = arr.values();
            expect(iterator.next()).toEqual({value: 'a',done: false});
            expect(iterator.next()).toEqual({value: 'b',done: false});
            expect(iterator.next()).toEqual({value: undefined,done: true});
            expect(iterator.next()).toEqual({value: undefined,done: true});

            //遍历器(iterator)也可以通过for...of...来遍历
            let r = [];
            iterator = arr.keys();
            for(let value of iterator){
                r.push(value);
            }
            expect(r).toEqual(['a','b']);
        });

        it('2-8) arr.includes',function() {
            /**
             * arr是否包含给定的值
             *
             * 语法：
             *  arr.includes(searchElement);
             *  arr.includes(searchElement,fromIndex);
             *
             * 参数：
             *  searchElement: 将要搜索的元素
             *  fromIndex: 搜索 searchElement的起始位置；默认为0，负数值为从数组末位开始数；
             *
             * 返回：
             *  一个boolean值
             * */
            var arr = [1,2,3,NaN,5,6,7,8,9];

            r = arr.includes(7);
            expect(r).toBe(true);

            r = arr.includes(7,-3);
            expect(r).toBe(true);

            r = arr.includes(7,-2);
            expect(r).toBe(false);

            var r = arr.includes(NaN);
            expect(r).toBe(true);
        });
    });

    describe('3) 数组空位',function(){
        it('3-1) 空位不是undefined',function(){
            var arr = [undefined,,,];
            expect(0 in arr).toBe(true);
            expect(1 in arr).toBe(false);
            expect(2 in arr).toBe(false);
            expect(arr.length).toBe(3);
        });

        describe('3-2) 会忽略数组空位的操作',function() {
            var arr,r;
            beforeEach(function(){
                arr = [1,,,];
                r = [];
            });

            it('3-2-1) forEach',function(){
                arr.forEach(function(item){
                    r.push('x.x');
                });
                expect(r.length).toBe(1);
            });

            it('3-2-2) filter',function(){
                arr.filter(function(item){
                    r.push('x.x');
                });
                expect(r.length).toBe(1);
            });

            it('3-2-3) every',function() {
                arr.every(function(item){
                    r.push('x.x');
                });
                expect(r.length).toBe(1);
            });

            it('3-2-4) some',function() {
                arr.some(function(item){
                    r.push('x.x');
                });
                expect(r.length).toBe(1);
            });

            it('3-2-5) map',function() {
                arr = arr.map(function(item){
                    r.push('x.x');
                    return item*2;
                });
                expect(r.length).toBe(1);
                //map会保留空位
                expect(arr).toEqual([2,,,]);
            });
        });

        describe('3-3) 不会忽略数组空位的操作',function(){
            it('3-3-1) Array.from',function() {
                var arr = Array.from([1,,3]);
                expect(arr).toEqual([1,undefined,3]);
                expect(1 in arr).toBe(true);
            });

            it('3-3-2) 扩展运算符：...',function() {
                var arr = [...[1,,3]];
                expect(arr).toEqual([1,undefined,3]);
                expect(1 in arr).toBe(true);
            });

            it('3-3-3) arr.fill',function() {
                var arr = [1,,2].fill('x.x');
                expect(arr).toEqual(['x.x','x.x','x.x']);
            });

            it('3-3-4) for...of',function() {
                var arr = [1,,2],r = [];
                for(let item of arr){
                    r.push(item);
                }
                expect(r.length).toBe(3);
                expect(r).toEqual([1,undefined,2]);
            });
        });


    });
});