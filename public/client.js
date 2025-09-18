// public/client.js
(function() {
    // HLS 설정
    const streamKey='test';
    const hlsUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;

    document.getElementById('m3u8').textContent = hlsUrl;               // m3u8이 머지
    const video = document.getElementById('viedo');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANITEST_PARSED, () => video.play().catch(()=>{}));
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', () => video.play().catch(()=>{}));
    } else {
        video.poster = '';
        console.error('HLS not supported in this browser');
    }

    // Socket.IO 채팅
    const socket = io('http://localhost:3000');

    const messageEl = document.getElementById('messages');
    const nickEl = document.getElementById('nick');
    const msgEl = document.getElementById('msg');
    const sendBtn = document.getElementById('send');

    function appendSystem(text) {
        const div = document.createElement('div');
        div.className = 'system';
        div.textContent = text;
        messageEl.appendChild('div');
        messageEl.scrollTop = messageEl.scrollHeight;
    }

    function appendChat({ nick, msg}) {
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `<span class="nick">${escapeHtml(nick)}</span><span>${escapeHtml(msg)}</span>`;
        messageEl.appendChild(div);
        messageEl.scrollTop = messageEl.scrollHeight;
    }

    function escapeHtml(s) {
        return s.replace(/[&<>"'`=\/]/g, function (c) {     // 이건 무슨 뜻일까..?
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#61;'}[c];
        });
    }

    sendBtn.addEventListener('click', () => {
        const nick = nickEl.value.trim() || '익명';
        const msg = msgEl.value.trim();
        if (!msg) return;
        socket.emit('chat', msg);
        msgEl.value = '';
    })

    // 초기 입장 닉네임 전송(optional)
    socket.on('connect', () => {
        const nick = nickEl.value.trim() || '익명';
        socket.emit('join', nick);
    });

    socket.on('system', (text) => appendSystem(text));
    socket.on('chat', (payload) => appendChat(payload));
})();