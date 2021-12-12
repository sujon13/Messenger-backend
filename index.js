const express = require('express');
const app = express();
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const whiteList = [
    'http://messenger.sujon13.s3-website.ap-south-1.amazonaws.com', 
    'http://localhost',
    "http://127.0.0.1"
];

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: whiteList
    }
});

// common middlewire
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(helmet());

const corsOptions = {
    origin: whiteList
};
app.use(cors(corsOptions));

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

const verifyToken = (token) => {
    console.log('token: ', token);

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (decoded.isAccessToken === false) {
        console.log('access denied!');
        return 'Access Denied! Token is invalid';
    } else {
        return decoded;
    }
};


io.on('connection', (socket) => {
    //console.log('user connected', socket);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (socket.user) {
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
            const user = verifyToken(token);
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
// for mongoose

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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`app listening at http://localhost:${PORT}`);
});
