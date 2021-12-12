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

const updateLastMessage = async (data) => {
    const createMessage = (data) => {
        const hashId = data.from < data.to 
        ? data.from + '#' + data.to
        : data.to + '#' + data.from;

        return new LastMessage({
            hashId: hashId, 
            text: data.text,
            from: data.from,
            to: data.to,
            time: Date.now(),
            status: 'sent'
        });
    }
    
    try {
        const lastMessageList = await LastMessage.find({ hashId: hashId });
        //console.log('lastMessage', lastMessageList);
        if (lastMessageList.length > 0) {
            const lastMessage = lastMessageList[0];
            lastMessage.text = data.text;
            lastMessage.from = data.from;
            lastMessage.to = data.to;
            lastMessage.time = data.time;
            //lastMessage.status = 
            await lastMessage.save();
            console.log('updated successfuly for hashId: ', hashId);
        } else {
            const message = createMessage(data);
            await message.save();// create new entry
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