//    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --unsafely-treat-insecure-origin-as-secure="http://192.168.0.88:8000" --user-data-dir=~/tmp
//   "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --unsafely-treat-insecure-origin-as-secure="http://192.168.0.88:8000" --user-data-dir=本地目录

var wsConnection = new WebSocket('ws://demo2.eidui.com:8888');
var loginPage = document.querySelector('#login-page');
var usernameInput = document.querySelector('#username');
var loginButton = document.querySelector('#login');
var callPage = document.querySelector('#call-page');
var theirUsernameInput = document.querySelector('#their-username');
var callButton = document.querySelector('#call');
var hangUpButton = document.querySelector('#hang-up');

var yourVideo = document.querySelector('#yours');
var theirVideo = document.querySelector('#theirs');
var yourRTCConnection;
var connectedUser;
var stream;



$(".sure_click").click(function () {
    $(".right_two").css("display", "none");
    $(".right_three").css("display", "block");
    wsConnection.send(JSON.stringify({ type: "other", message: "buttoncanclick", name: "phone" }));
})

hangUpButton.addEventListener("click", () => {
    wsConnection.send(JSON.stringify({ type: "leave", name: connectedUser }));
    onLeave();
});

wsConnection.onopen = function () {
    console.log(" Connected");
    // 自动登录\
    wsConnection.send(JSON.stringify({ type: "login", name: "pc" }));
};


// 通过 回 调 函数 处理 所有 的 消息 
wsConnection.onmessage = (message) => {
    console.log(" Got message", message.data);
    var data = JSON.parse(message.data);
    console.log(data.message);
    switch (data.type) {
        case "login":
            onLogin(data.success);
            window.setInterval("countTime()", 30000);
            break;
        case "offer":
            onOffer(data.offer, data.name);
            break;
        case "answer":
            onAnswer(data.answer);
            break;
        case "candidate":
            onCandidate(data.candidate);
            break;
        case "leave":
            onLeave();
            break;
        case "other":
            if (data.message == "buttonclicked") {
                $(".buffer").css("display", "none");
                $(".accountant").css("display", "block");
                $(".right_three").css("display", "none");
                $(".right_four").css("display", "block");
            } else if (data.message == "resetpage") {
                $(".buffer").css("display", "block");
            } else if (data.message == "urlclicked") {
                $(".buffer").css("display", "none");
            }
            break;
        default:
            break;
    }
};

wsConnection.onerror = (err) => console.log(" Got error", err);






function onLogin(success) {
    if (success === false) {
        alert(" Login unsuccessful, please try a different name.");
    }
    else {
        // 准备好 通话 的 通道 { ideal: 10, max: 15 }
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((myStream) => {
                stream = myStream
                yourVideo.srcObject = stream;
                setupPeerConnection(stream);
            })
            .catch(
                (error) => console.log(error)
            );
    }
};

function onOffer(offer, name) {
    connectedUser = name;
    yourRTCConnection.setRemoteDescription(new RTCSessionDescription(offer)).catch((error) => console.log("set error " + error));
    yourRTCConnection.createAnswer()
        .then((answer) => {
            yourRTCConnection.setLocalDescription(answer).catch((error) => console.log("set error " + error));
            wsConnection.send(JSON.stringify({ type: "answer", answer: answer, name: connectedUser }));
        })
        .catch(
            (error) => alert(" An error has occurred" + error)
        );
};
function onAnswer(answer) {
    yourRTCConnection.setRemoteDescription(new RTCSessionDescription(answer)).catch((error) => console.log("set error " + error));
};
function onCandidate(candidate) {
    yourRTCConnection.addIceCandidate(new RTCIceCandidate(candidate));
};
function onLeave() {
    connectedUser = null;
    theirVideo.srcObject = null;
    yourRTCConnection.close();
    yourRTCConnection.onicecandidate = null;
    yourRTCConnection.ontrack = null;
    //yourRTCConnection.onaddstream = null;
    setupPeerConnection(stream);
}



function setupPeerConnection(stream) {

    yourRTCConnection = new RTCPeerConnection(
        //局域网下不需要
        //{ "iceServers": [{ "url": "stun:23.21.150.121" },{ "url": "stun:stun.iptel.org" },{ "url": "stun:stun.xten.net" },{ "url": "stun:stun.1.google.com:19302" }] }  
    );
    // 设置 流的 监听 
    /*
        yourRTCConnection.addStream(stream);
        yourRTCConnection.onaddstream = (e) => {
            theirVideo.srcObject = e.stream
        }
    */

    stream.getTracks().forEach((track) => {
        console.log("addTrack")
        yourRTCConnection.addTrack(track, stream)
    });

    yourRTCConnection.ontrack = (event) => {
        console.log("ontrack streams-len:" + event.streams.length)
        theirVideo.srcObject = event.streams[0];
    };

    // 设置 ice 处理 事件 
    yourRTCConnection.onicecandidate = (event) => {
        if (event.candidate) {
            wsConnection.send(JSON.stringify({ type: "candidate", candidate: event.candidate, name: connectedUser }));
        }
    };
}
function countTime() {
    wsConnection.send(JSON.stringify({ type: "other", message: "xxx", name: "xxx" }));
}

























