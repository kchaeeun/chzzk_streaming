const path = require('path');
const express = require('express')
const NodeMediaServer = require('node-media-server');
const http = require('http');
const { Server } = require('socket.io');

// Node-Media-Server 설정
const config = {
    logType: 3,
    rtmp: {
        port:1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
    },
    http: {
        port: 8000,
        allow_origin: '*'
    },
    trans: {
        ffmpeg: 'C:\\ffmpeg\\bin\\ffmpeg.exe',
        tasks: [
            {
                app: 'live',
                hls: true,
                hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
                dash: false
            }
        ]

    }  
}

const nms = new NodeMediaServer(config);
nms.run();

// Express = Socket.IO(채팅 + 정적파일)
const app = express();
const server = http.createServer(app);
const io = new Server(server, {cors: {origin: '*'}});

// 정적 파일 제공 (public 폴더)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 간단한 헬스체크
app.get('/health', (req, res) => res.send('ok'));

// Socket.IO: 기본 채팅 (실사용 전 인증/필터링 추가 필요)
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join', (nick) => {
        socket.data.nick = nick || '익명';
        io.emit('system', `${socket.data.nick} 님이 입장했습니다`)
    });

    socket.on('chat', (msg) => {
        const payload = { nick: socket.data.nick || '익명', msg, time: Date.now()};
        io.emit('chat', payload);
    })

    socket.on('disconnect', () => {
        if (socket.data.nick) {
            io.emit('system', `${socket.data.nick} 님이 퇴장했습니다`);
        }
        console.log('Socket disconnected:', socket.id);
    });
});

// Express 서버(채팅용) 포트
const CHAT_PORT = 3000;
server.listen(CHAT_PORT, () => {
    console.log(`Chat server running at http://localhost:${CHAT_PORT}`);
});

// Node-Media-Server의 HTTP(포트 8000)는 HLS 재생 URL 제공
console.log('NodeMediaServer RTMP running at rtmp://localhost/live');
console.log('HLS (browser) example: http://localhost:8000/live/test/index.m3u8');    // 시크릿 키 나중에 변경