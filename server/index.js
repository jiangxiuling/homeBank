var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({ host:"0.0.0.0",port: 8888 });
var users = {}


wss.on('listening', () => console.log(" Server started..."));


wss.on("connection", (connection) => {
    console.log(" User connected");

    connection.on("message", (message) => {
        var data;
        console.log("recv from "+connection.name+"\n"+message);
        try { data = JSON.parse(message); }
        catch (e) {
            console.log(" Error parsing JSON");
            data = {};
        }
        if (!data.name) { data = {}; }
        switch (data.type) {
            case "login":
                if (users[data.name]) {
                    console.log("send to "+connection.name+"\n"+JSON.stringify({ type: "login", success: false }));
                    connection.send(JSON.stringify({ type: "login", success: false }));

                    //重复登陆就踢掉前一个登陆的连接
                    var exConnection=users[data.name]
                    console.log(exConnection.name+" is closing");
                    delete users[exConnection.name];
                    if (exConnection.otherName) {
                        console.log(exConnection.name+" is disconnecting user from", exConnection.otherName);
                        var conn2 = users[exConnection.otherName];
                        //对等连接同时关闭就可能导致这种情况
                        if (conn2 != null) {
                            conn2.otherName = null;
                            console.log("send to "+exConnection.otherName+"\n"+JSON.stringify({ type: "leave" }));
                            conn2.send(JSON.stringify({ type: "leave" }));
                        }
                    }
                }
                else {
                    users[data.name] = connection;
                    connection.name = data.name;
                    console.log("send to "+connection.name+"\n"+JSON.stringify({ type: "login", success: true }));
                    connection.send(JSON.stringify({ type: "login", success: true }));
                }
                break;
            case "offer":
                var conn2 = users[data.name];
                if (conn2 != null) {
                    connection.otherName = data.name;
                    console.log("send to "+connection.otherName+"\n"+JSON.stringify({ type: "offer", offer: data.offer, name: connection.name }));
                    conn2.send(JSON.stringify({ type: "offer", offer: data.offer, name: connection.name }));
                }
                break;
            case "answer":
                var conn2 = users[data.name];
                if (conn2 != null) {
                    connection.otherName = data.name;
                    console.log("send to "+connection.otherName+"\n"+JSON.stringify({ type: "answer", answer: data.answer }));
                    conn2.send(JSON.stringify({ type: "answer", answer: data.answer }));
                }
                break;
            case "candidate":
                var conn2 = users[data.name];
                if (conn2 != null) {
                    console.log("send to "+connection.otherName+"\n"+JSON.stringify({ type: "candidate", candidate: data.candidate }));
                    conn2.send(JSON.stringify({ type: "candidate", candidate: data.candidate }));
                }
                break;
            case "leave":
                console.log(connection.name+" is Disconnecting user from", data.name);
                var conn2 = users[data.name];
                conn2.otherName = null;
                if (conn2 != null) {
                    console.log("send to "+connection.otherName+"\n"+JSON.stringify({ type: "leave" }));
                    conn2.send(JSON.stringify({ type: "leave" }));
                }
                break;

            default:
                console.log("send to "+connection.name+"\n"+JSON.stringify({ type: "error", message: "Unrecognized command: " + data.type }));
                connection.send(JSON.stringify({ type: "error", message: "Unrecognized command: " + data.type }));
                break;
        }
    });

    connection.on("close", function () {
        if (connection.name) {
            console.log(connection.name+" is closing");
            delete users[connection.name];
            if (connection.otherName) {
                console.log(connection.name+" is disconnecting user from", connection.otherName);
                var conn2 = users[connection.otherName];
                //对等连接同时关闭就可能导致这种情况
                if (conn2 != null) {
                    conn2.otherName = null;
                    console.log("send to "+connection.otherName+"\n"+JSON.stringify({ type: "leave" }));
                    conn2.send(JSON.stringify({ type: "leave" }));
                }
            }
        }
    });


});



