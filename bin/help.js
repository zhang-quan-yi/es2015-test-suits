#!/usr/bin/env node
let chalk = require('chalk');
let chapters = require('./chapters.js');
let yargs = require('yargs');

yargs
    .usage('Usage: npm run chapter [num]')
    .options({
        "chapter": {
            type: 'number',
            describe: '根据提供的章节号来执行具体的测试用例；'
        }
    });
yargs.showHelp();
displayContent();

function displayContent() {
    console.log('章节：');
    chapters.forEach(function(item) {
        let chapter = item[0];
        let content = item[1];
        let color = item[2]||'blue';
        console.log(" ",chapter," ",chalk[color](content));
    });
}
