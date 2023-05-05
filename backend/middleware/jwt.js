const { expressjwt } = require('express-jwt');


function auth() {
    const secret = process.env.SECRET;
    const api = process.env.API_URL;
    return expressjwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            { url: /\/api\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            { url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    });
}

/**
 * 
 * @param {*} req The request
 * @param {*} payload The data from the token (The user)
 * @param {*} done 
 */
async function isRevoked(req, payload, done) {

    if(!payload.payload.isAdmin){
        return true;
    }else{
        return false;
    }
}

module.exports = auth;