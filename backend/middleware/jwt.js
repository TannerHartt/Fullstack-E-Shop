const { expressjwt } = require('express-jwt');


function auth() {
    const secret = process.env.SECRET;
    return expressjwt({
        secret,
        algorithms: ['HS256'],
    });
}

module.exports = auth;