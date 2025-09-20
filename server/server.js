const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));  // 클라이언트 파일 제공

io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("offer", (data) => {
        socket.broadcast.emit("offer", data);
    })

    socket.on("answer", (data) => {
        socket.broadcast.emit("answer", data);
    })

    socket.on("candidate", (data) => {
        socket.broadcast.emit("candidate", data);
    })

    socket.on("disconnect", (data) => {
        console.log("user disconnected", socket.id);
    });

    socket.on("requestOffer", () => socket.broadcast.emit("requestOffer"));

    // --- 채팅 메시지 수신 ---
    socket.on("chatMessage", (msg) => {
        console.log("chat:", msg);
        // 모든 클라이언트에게 전달
        io.emit("chatMessage", {id: socket.id, message: msg});
    })
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
