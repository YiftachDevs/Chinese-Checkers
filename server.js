const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const path = require('path');

// השורה הזו אומרת לשרת לשלוח את קובץ ה-index.html כשמישהו נכנס לאתר
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
const server = http.createServer(app);
const io = new Server(server);

// מצב הלוח התחלתי: מערך של אובייקטים {id, color, x, y}
let pieces = [];    
let idCounter = 0;

// יצירת הכלים בתחילת המשחק
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        if (row < 3 && col < 3) {
            pieces.push({ id: idCounter++, color: 'black', row, col });
        } else if (row >= 8 - 3 && col >= 8 - 3) {
            pieces.push({ id: idCounter++, color: 'red', row, col });
        }
    }
}

io.on('connection', (socket) => {
    // שולח לשחקן החדש את מצב הלוח הנוכחי
    socket.emit('boardState', pieces);

    // עדכון תזוזה מכל שחקן
    socket.on('movePiece', (data) => {
        const piece = pieces.find(p => p.id === data.id);
        if (piece) {
            piece.row = data.row;
            piece.col = data.col;
            // שליחה לכולם חוץ מהשולח כדי למנוע קפיצות
            socket.broadcast.emit('pieceMoved', data);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));