const Message = require('../models/Message');
const UserStatus = require('../models/UserStatus');

const save = async (data) => {
    const message = new Message({
        text: data.text,
        from: data.from,
        to: data.to,
        time: data.time,
        status: 'sent'
    });

    try {
        const createdMessage = await message.save();
        console.log('createdMessage is: ', createdMessage);
        return createdMessage;
    } catch(error) {
        console.log(error);
        return null;
    }
}

const updateMessageStatus = async (messageId, status) => {
    try {
        const message = await Message.findById(messageId);
        if(!message) {
            return;
        }
        message.status = status;
        message.save();
    } catch(error) {
        console.log(error);
    }
}

const getUser = async (email) => {
    try {
        const user = await UserStatus.find({userEmail: email});
        if (user.length > 0) {
            console.log('user found');
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
        const user = await UserStatus.find({userEmail: email});
        console.log(user);
        if (user.length > 0) {
            const lastSeen = user[0].lastSeen;
            console.log(Date.now(), lastSeen);
            const isActive = Date.now() - lastSeen <= 60*1000;
            return {
                isActive: isActive,
                socketIdList: user[0].socketIdList
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