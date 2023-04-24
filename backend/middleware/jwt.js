const { expressjwt } = require('express-jwt');


function auth() {
    const secret = process.env.SECRET;
    const api = process.env.API_URL;
    return expressjwt({
        secret,
        algorithms: ['HS256'],
    }).unless({
        path: [
            { url: /\/api\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    });
}

module.exports = auth;