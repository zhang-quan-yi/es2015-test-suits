describe('Day 3:string',function(){
    // describe('字符的 Unicode 表示法',function(){
    //     it('可以表示码点在\\u0000~\\uFFFF以外的字符',function(){
    //         // 正常情况下：
    //         expect("\u0061").toBe('a');
    //
    //         // 码点超出FFFF的情况:
    //         expect("\u20bb7").toBe('₻7');//被解析成了 \u20bb + 7
    //
    //         // 在es6中，超过FFFF的字符,将码点放入大括号{}中可以正常解析
    //         expect("\u{20bb7}").toBe('𠮷');
    //     });
    //
    //     it('codePointAt',function(){
    //         /**
    //          * JavaScript内部，字符以UTF-16的格式储存，每个字符固定为2个字节
    //          * 对于那些需要4个字节储存的字符,比如'𠮷'（Unicode码点大于0xFFFF的字符）
    //          * JavaScript会认为它们是两个字符
    //          * */
    //
    //         let normalChar = 'a';//十六进制码点是 \u0061
    //         let specialChar= '𠮷';//十六进制码点是 \u20bb7,
    //
    //         expect(normalChar.length).toBe(1);
    //         expect(specialChar.length).toBe(2);
    //
    //         //charAt不能正确识别4字节字符
    //         expect(normalChar.charAt(0)).toBe('a');
    //         //expect(specialChar.charAt(0)).toEqual('�');
    //         //expect(specialChar.charAt(1)).toBe('�');
    //
    //         // codePointAt可以正确识别
    //         expect(normalChar.codePointAt(0)).toBe(97);//十六进制为0x 61
    //         expect(specialChar.codePointAt(0)).toBe(134071);//十六进制为 0x 20bb7
    //
    //         //134071 = 0x 20bb7 = 100000101110110111 =
    //         expect('𠮷a'.codePointAt(0)).toBe(134071);
    //         expect('𠮷a'.codePointAt(1)).toBe(57271);
    //         expect('𠮷a'.codePointAt(2)).toBe(97); //十六进制为0x 61
    //     });
    //
    // });
});