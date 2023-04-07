const { expressjwt } = require('express-jwt');


function auth() {
    const secret = process.env.SECRET;
    return expressjwt({
        secret,
        algorithms: ['HS256'],
    }).unless({
        path: [
            '/api/v1/users/login',
            '/api/v1/users/register',
        ]
    });
}

module.exports = auth;