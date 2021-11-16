var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 9999;
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});
app.use(express.static('public'));
var numUsers = 0;
var currentUsers = {};
io.on('connection', function (socket) {
    var addedUser = false;
    socket.on('new message', function (data) {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });
    socket.on('add user', function (data) {
        const { username } = data;
        if (addedUser)
            return;
        socket.username = username;
        currentUsers[username] = data;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers,
            currentUsers
        });
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers,
            currentUsers
        });
    });
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });
    socket.on('player moved', function (data) {
        socket.broadcast.emit('player moved', {
            username: data.username,
            orientation: data.orientation
        });
    });
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
//# sourceMappingURL=server.js.map