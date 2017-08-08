module.exports = function (file){
    return new Promise(
        function(resolve,reject){
            setTimeout(function(){
                resolve(file+ ' data');
            },0);
        }
    );
};