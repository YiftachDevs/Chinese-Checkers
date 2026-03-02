const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// הגשת קבצים סטטיים מהתיקייה הנוכחית
app.use(express.static(__dirname));

// ניתוב ראשי לקובץ ה-HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let pieces = [];

function init() {
    pieces = [];
    let idCounter = 0;

    // יצירת לוח התחלתי
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (col < 3 && row < 3) {
                pieces.push({ id: idCounter++, color: 'black', row, col });
            } else if (col >= 8 - 3 && row >= 8 - 3) {
                pieces.push({ id: idCounter++, color: 'red', row, col });
            }
        }
    }
}

init()

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    socket.emit('boardState', pieces);

    socket.on('movePiece', (data) => {
        const piece = pieces.find(p => p.id === data.id);
        if (piece) {
            piece.row = data.row;
            piece.col = data.col;
            socket.broadcast.emit('pieceMoved', data);
        }
    });

    socket.on('init', (data) => {
        init()
        socket.broadcast.emit('init', data);
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});