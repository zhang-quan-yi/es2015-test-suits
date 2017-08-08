#!/usr/bin/env node
let sh = require('shelljs');
let chalk = require('chalk');
let karmaServer = require('karma').Server;
let karmaConfigSet = require('karma').config;
let path = require('path');
let yargs = require('yargs');
let chapters = require('./chapters.js');

yargs
    .usage('Usage: npm run chapter [num]')
    .options({
        "chapter": {
            type: 'number',
            describe: '根据提供的章节号来执行具体的测试用例；'
        }
    });

let file = getTestSuitFile();

if(file){
    let filePath = path.resolve('./test/',file);
    let cfg = karmaConfigSet.parseConfig(path.resolve('./karma.conf.js'),{
        files: [filePath],
        preprocessors: {[filePath]: ['webpack','sourcemap']}
    });

    let server = new karmaServer(cfg,function(exitCode) {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
    });
    server.start();
}else{
    yargs.showHelp();
    displayContent();
}

function getTestSuitFile(){
    let argv = process.argv[2];
    let file;
    let chapter = parseFloat(argv);
    if(argv === 'all'){
        file = '*.spec.js';
    }else if(chapter>0||chapter<=19){
        chapter = chapter<10?('0'+ chapter):chapter;

        let result = sh.ls('./test');
        result = result.stdout.split("\n");
        if(result.length>0){
            result.forEach(function(item){
                if(item.indexOf(chapter) !==-1){
                    file = item;
                }
            });
        }
    }
    return file;
}



function displayContent() {
    console.log('章节：');
    chapters.forEach(function(item) {
        let chapter = item[0];
        let content = item[1];
        let color = item[2]||'blue';
        console.log(" ",chapter," ",chalk[color](content));
    });
}