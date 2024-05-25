const socket = io();

function register() {
    const username = document.getElementById('username').value;
    socket.emit('register', username);
    document.getElementById('login').style.display = 'none';
    document.getElementById('choices').style.display = 'block';
}

function makeChoice(choice) {
    socket.emit('choice', { choice });
    document.getElementById('status').innerHTML = `<h2>Waiting for other player...</h2>`;
}

socket.on('playerAssigned', (player) => {
    document.getElementById('status').innerHTML = `<h2>You are ${player.username}</h2>`;
});

socket.on('result', (data) => {
    const { result, winner, loser, choices, players } = data;

    if (result === 'draw') {
        const choice = choices[Object.keys(choices)[0]];
        document.getElementById('result').innerHTML = `<h2>It's a draw! Both players chose ${choice}</h2>`;
    } else {
        if (winner && loser) {
            document.getElementById('result').innerHTML = `
                <h2>${winner.username} wins! ${loser.username} loses!</h2>
                <p>${winner.username} chose ${choices[winner.id]}</p>
                <p>${loser.username} chose ${choices[loser.id]}</p>
            `;

            document.getElementById('scoreboard').innerHTML = `
                <p>${winner.username} has ${winner.wins} wins</p>
                <p>${loser.username} has ${loser.losses} losses</p>
            `;
        } else {
            console.error('Winner or loser is undefined');
        }
    }
});


socket.on('updatePlayers', (players) => {
    console.log('Players:', players);
});
