const express = require('express');
const app = express();
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const server = http.createServer(app);
const io = socketio(server);

// common middlewire
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(helmet());
app.use(cors());


//local import
const { save,  updateUserStatus, isActive } = require('./controllers/messageController');


const messageRoute = require('./routes/messageRoutes');
app.use('/api/v1', messageRoute);
const statusRoutes = require('./routes/statusRoutes');
app.use('/api/v1/status', statusRoutes);

app.get('/', async (req, res, next) => {
    //console.log(__dirname)
    res.sendFile(__dirname + '/index.html');
});

const verifyToken = async (token) => {
    console.log('token: ', token);
    return new Promise(async (resolve, reject) => {
        try {
            const decoded = await jwt.verify(token, process.env.TOKEN_SECRET);
            if (decoded.isAccessToken === false) {
                console.log('access denied!');
                reject('Access Denied! Token is invalid');
            } else {
                resolve(decoded);
            }
        } catch (err) {
            console.log(err);
            reject(err);
        }
    });
};


io.on('connection', (socket) => {
    //console.log('user connected', socket);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (socket.user)  {
            console.log('user disconnected: ', socket.user.email);
            socket.leave(socket.user.email);
            socket.disconnect(true);
        }
    });
    
    socket.on('chat', async (data) => {
        console.log(data);
        // save to db
        let savedMessage;
        try {
            //save(data);
            savedMessage = await save(data);
            console.log('saved message is: ', savedMessage);
        } catch(error) {
            console.log(error);
            return;
        }

        // if active send message
        console.log('is active?');
        const response = await isActive(data.to);
        console.log(response.isActive);
        if (response.isActive) {
            //socket.broadcast.to(data.to).emit('chat', data);
            socket.broadcast.emit('chat', data);
        }
    });

    socket.on('heart-bit', async (data) => {
        await updateUserStatus(data);
    });

    socket.on('token', async (token) => {
        console.log('token');
        try {
            const user = await verifyToken(token);
            socket.user = user;
            console.log(`${user.email} is joining`);
            socket.join(user.email);
    
            await updateUserStatus(user.email, socket.id);
        } catch (err) {
            console.log('user will be disconnected forcefully');
            console.log(err);
            socket.disconnect(true);
        }
    });
});

// connect db
const mongoose = require('mongoose');
require('dotenv/config');
// for mongoose
mongoose.set('useFindAndModify', false);

mongoose.connect(
    process.env.DB_CONNECTION,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    () => {
        console.log('connected to chat database');
    }
);

require('dotenv/config');
const PORT = 4001 || process.env.PORT;
server.listen(PORT, () => {
    console.log(`app listening at http://localhost:${PORT}`);
});
