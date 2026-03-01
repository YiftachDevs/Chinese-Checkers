const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const path = require('path');

app.get('/', (req, res) => {
    // __dirname מבטיח ש-Node יחפש בתיקייה שבה נמצא השרת
    res.sendFile(path.join(__dirname, 'index.html'));
});
const server = http.createServer(app);
const io = new Server(server);

// הגדרת הפורט - Render נותן פורט משתנה, לכן משתמשים ב-process.env.PORT
const PORT = process.env.PORT || 3000;

// שליחת קובץ ה-HTML כשנכנסים לאתר
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// מצב הלוח (Sandbox)
let pieces = [];
let idCounter = 0;

// יצירת הכלים (כמו קודם)
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 !== 0) {
            if (row < 3) pieces.push({ id: idCounter++, color: 'black', row, col });
            if (row > 4) pieces.push({ id: idCounter++, color: 'red', row, col });
        }
    }
}

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    // שליחת המצב הנוכחי לשחקן שהתחבר
    socket.emit('boardState', pieces);

    // סנכרון תזוזות
    socket.on('movePiece', (data) => {
        const piece = pieces.find(p => p.id === data.id);
        if (piece) {
            piece.row = data.row;
            piece.col = data.col;
            socket.broadcast.emit('pieceMoved', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected');
    });
});

// הפעלה על הפורט הדינמי
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});