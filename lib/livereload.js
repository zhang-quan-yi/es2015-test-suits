let socket = io(window.location.host, { path: "/socket.io" });
let register = function(){
    socket.on("execute", function () {
        window.location.reload();
    });
};
register();

