 const expressJWT = require('express-jwt');

 function authJWT(){
     const secret = process.env.secret;
     const api = process.env.API_URL;
     return expressJWT({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
     }).unless({
         path: [
             {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
             {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
             {url: /\/public\/uploads(.*)/, methods: ['GET', 'OPTIONS']},
             {url: /\/api\/v1\/orders(.*)/,methods: ['GET', 'OPTIONS', 'POST']},
             `${api}/users/login`,
             `${api}/users/register`,
         ]
     })
 }

 async function isRevoked(req, payload, done){
    if(!payload.isAdmin){
        done(null, true);
    }
    done();
 }

 module.exports = authJWT;