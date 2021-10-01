const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router/router');
const { addUser, removeUer, getUser, getUsersInRoom } = require('./methods/users');

const app = express();
const server = http.createServer(app)
const io = socketio(server)             // setting up socket io server

app.use(express.json({ extended: false }));

// this would run when we have client connection on our io server
io.on('connection', (socket) => {
    console.log('we have our new connection!');

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        socket.emit('message', { user: 'admin', text: `Hello ${user.name}, Welcome to the ${user.room} room` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
        socket.join(user.room);

        callback();     // error call back would be called everytime

        // console.log(name, room);

        // const error = true;
        // if (err) {
        //     callback({ error: 'error' });
        // }
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

    socket.on('disconnect', () => {
        console.log('User had left!');
    })
});

app.use(router);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on ${PORT}`));



// "proxy": "http://localhost:5000"



// "server": "nodemon server",
//     "client": "npm start --prefix client",
//     "dev": "concurrently \"npm run server\" \"npm run client\""