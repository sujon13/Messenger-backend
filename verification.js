import { verify } from 'jsonwebtoken';
import createError from 'http-errors';

const verifyToken = async (socket, next) => {
    const authHeader = socket.handshake.query['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        var token = authHeader.substring(7, authHeader.length);
    } else {
        //return next(createError(401, 'Access Denied! Token is invalid'));
        console.log('Access Denied! Token is invalid');
        console.log(authHeader);
        return;
    }

    //verify a token symmetric
    verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
            //return next(createError(401, err));
            console.log(err);
            return;
        }
        console.log(decoded);
        if (decoded.isAccessToken === false) {
            console.log('access denied!');
            //next(createError(401, 'Access Denied! Token is invalid'));
            return;
        } else {
            next();
        }
    });
};

const _verifyToken = verifyToken;
export { _verifyToken as verifyToken };
