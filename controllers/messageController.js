const Message = require('../models/Message');
const LastMessage = require('../models/LastMessage');
const UserStatus = require('../models/UserStatus');

const save = async (data) => {
    const message = new Message({
        text: data.text,
        from: data.from,
        to: data.to,
        time: Date.now(),
        status: 'sent'
    });

    try {
        const createdMessage = await message.save();
        console.log('createdMessage is: ', createdMessage);

        // update last message
        await updateLastMessage(message);
        return createdMessage;
    } catch(error) {
        console.log(error);
        return null;
    }
}

const updateLastMessage = async (message) => {
    const hashId = message.from < message.to 
        ? message.from + '#' + message.to
        : message.to + '#' + message.from;
    
    try {
        const lastMessageList = await LastMessage.find({ hashId: hashId });
        //console.log('lastMessage', lastMessageList);
        if (lastMessageList.length > 0) {
            const lastMessage = lastMessageList[0];
            lastMessage.text = message.text;
            lastMessage.from = message.from;
            lastMessage.to = message.to;
            lastMessage.time = message.time;
            //lastMessage.status = 
            await lastMessage.save();
            console.log('updated successfuly for hashId: ', hashId);
        } else {
            const newMessage = new LastMessage({
                hashId: hashId, 
                text: message.text,
                from: message.from,
                to: message.to,
                time: message.time,
                status: message.status
            });
            await newMessage.save();// create new entry
            console.log('created successfuly for hashId: ', hashId);
        }
    } catch(error) {
        console.log(error);
    }
}

const updateMessageStatus = async (messageId, status) => {
    try {
        const message = await Message.findById(messageId);
        if(!message) {
            return;
        }
        message.status = status;
        await message.save();
    } catch(error) {
        console.log(error);
    }
}

const getUser = async (email) => {
    try {
        const user = await UserStatus.find({userEmail: email});
        if (user.length > 0) {
            //console.log('user found');
            return user[0];
        } else {
            const userStatus = await new UserStatus({
                userEmail: email,
                lastSeen: Date.now()
            }); 
            return userStatus;
        }
    } catch(error) {
        console.log(error);
        return null;
    }
}

const updateUserStatus = async (email, socketId) => {
    try {
        const user = await getUser(email);
        //console.log('user: ', user);
        if(user) {
            user.lastSeen = Date.now();
            await user.save();
        } else {
            console.log('error!');
        } 
    } catch(error) {
        console.log(error);
    }
}

const isActive = async (email) => {
    try {
        console.log(email);
        const users = await UserStatus.find({userEmail: email});
        //console.log(user);
        if (users.length > 0) {
            const lastSeen = users[0].lastSeen;
            //console.log(Date.now(), lastSeen);
            const isActive = (Date.now() - lastSeen) <= 60 * 1000;
            return { 
                isActive: isActive 
            }
        } else {
            console.log('user not found');
            return {
                isActive: false
            }
        }
    } catch(error) {
        console.log(error);
        return {
            isActive: false
        }
    }
}

module.exports.save = save;
module.exports.updateMessageStatus = updateMessageStatus;
module.exports.updateUserStatus = updateUserStatus;
module.exports.isActive = isActive;