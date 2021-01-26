const express = require('express');
const router = express.Router();
const config = require('../../config/config.json')

const http = require('http');
const passport = require('passport');

promiseGetUserMicro = (path) => {
    return new Promise(function(resolve, reject) {
        var postOption = {
            host: config.microservice.userservice.host,
            port: config.microservice.userservice.port,
            path: path
        }
        
        var post_req = http.get(postOption, function(res) {
            res.setEncoding('utf-8');
            res.on('data', function(chunk) {
                resolve(chunk);
            })
        })
    })
}

promiseUserMicro = (path, data) => {
    return new Promise(function(resolve, reject) {
        var postOption = {
            host: config.microservice.userservice.host,
            port: config.microservice.userservice.port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(data))
            }
        }
        
        var post_req = http.request(postOption, function(res) {
            res.setEncoding('utf-8');
            res.on('data', function(chunk) {
                resolve(chunk);
            })
        })
        post_req.write(JSON.stringify(data));
        post_req.end();
    })
}

promiseLog = (logData) => {
    return new Promise(function(resolve, reject) {
        var postOption = {
            host: config.microservice.logservice.host,
            port: config.microservice.logservice.port,
            path: '/log/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(logData))
            }
        }
        
        var post_req = http.request(postOption, function(res) {
            res.setEncoding('utf-8');
            res.on('data', function(chunk) {
                resolve(chunk);
            })
        })
        post_req.write(JSON.stringify(logData));
        post_req.end();
    })
}

/**
 * @swagger
 * /worker:
 *  post:
 *    description: Use to request all customers
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/list", (req, res) => {
    console.log("REQQ", req.body);
    let logData = {
        requestId: "S1-321i4713192838109",
        path: req.route.path,
        requestData: req.body
    }
    promiseGetUserMicro("/user/list").then(result => {
        logData.responseData = JSON.parse(result);
        promiseLog(logData).then(logResult =>
            console.log(logResult)
        )
        res.json(JSON.parse(result));
    }).catch(err => {
        res.json(err);
    })
});

router.post('/login', (req, res) => {
    console.log("REQQ", req.headers['user-agent']);
    let logData = {
        requestId: "S1-321i4713192838109",
        path: req.route.path,
        requestData: req.body
    }
    promiseUserMicro("/user/login", req.body).then(result => {
        logData.responseData = JSON.parse(result);
        promiseLog(logData).then(logResult =>
            console.log(logResult)
        )
        res.json(result);
    }).catch(err => {
        res.json(err);
    })
});

router.post('/register', (req, res) => {
    console.log("REQQ", req.body);
    let logData = {
        requestId: "S1-321i4713192838109",
        path: req.route.path,
        requestData: req.body
    }
    promiseUserMicro("/user/register", req.body).then(result => {
        logData.responseData = JSON.parse(result);
        promiseLog(logData).then(logResult =>
            console.log(logResult)
        )
        res.json(JSON.parse(result));
    }).catch(err => {
        res.json(err);
    })
});

router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.json({
        id: req.user.id,
        name: req.user.name
    });
});

module.exports = router;