const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let choices = {};

io.on('connection', (socket) => {
    socket.on('register', (username) => {
        players[socket.id] = { id: socket.id, username, wins: 0, losses: 0 };
        socket.emit('playerAssigned', players[socket.id]);
        io.emit('updatePlayers', players);
    });

    socket.on('choice', (data) => {
        choices[socket.id] = data.choice;

        if (Object.keys(choices).length === 2) {
            const [player1Id, player2Id] = Object.keys(choices);
            const result = determineWinner(choices[player1Id], choices[player2Id]);

            if (result === 'draw') {
                io.emit('result', { result: 'draw', choices, players });
            } else {
                const winnerId = result === 'player1' ? player1Id : player2Id;
                const loserId = result === 'player1' ? player2Id : player1Id;

                players[winnerId].wins += 1;
                players[loserId].losses += 1;

                io.emit('result', {
                    result: 'win',
                    winner: players[winnerId],
                    loser: players[loserId],
                    choices,
                });
            }

            choices = {};
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        delete choices[socket.id];
        io.emit('updatePlayers', players);
    });
});

function determineWinner(choice1, choice2) {
    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper',
    };

    if (choice1 === choice2) {
        return 'draw';
    }

    if (winConditions[choice1] === choice2) {
        return 'player1';
    }

    return 'player2';
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
