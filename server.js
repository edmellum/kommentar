var stream = require('stream');

var Hapi = require('hapi');
var React = require('react');
var level = require('levelup');
var PouchDB = require('pouchdb');
var JSONStream = require('JSONStream');

var hash = require('./hash');
var Kommentar = require('./kommentar');

var server = new Hapi.Server('localhost', 8000);

var i = 0;
//var db = level('./posts.db', {valueEncoding: 'json'});
var db = new PouchDB('kommentar');

var threadPosts = function(doc) {
    if(doc.type === 'post') {
        emit(doc.createdAt, {_id: doc.threadId});
    }
};

server.route({
    method: 'GET',
    path: '/threads/{threadid}/static',
    handler: function(req, reply) {
        var html = React.renderComponentToString(Kommentar());
        reply(html);
    }
});

server.route({
    method: 'GET',
    path: '/threads/{threadid}/posts',
    handler: function(req, reply) {
        // var readStream = db.createValueStream({
        //     gte: req.params.threadid,
        //     lte: req.params.threadid + '\xFF'
        // });
        
        // var res = readStream.pipe(JSONStream.stringify());

        // db.allDocs({include_docs: true}, function(err, res) {
        //     reply(res.rows);
        // });

        db.query({map: threadPosts}, {include_docs: true}, function(err, res) {
            console.log(err, res);
            reply(res.rows);
        });

        // reply(res)
        //     .type('application/json');
    }
});

server.route({
    method: 'POST',
    path: '/threads/{threadId}/posts',
    handler: function(req, reply) {

        var auth = req.headers.authorization.split(' ');
        var signature = auth[0];
        var check = new Buffer(auth[1], 'base64').toString('ascii');
        check = hash('secretgoeshere' + check);
        console.log(signature, check, signature === check);
        var post = {
            type: 'post',
            text: req.payload.text,
            userId: req.payload.userId,
            threadId: req.params.threadId,
            createdAt: Date.now()
        };
        
        i += 1;
        // db.put(req.params.threadid + ':' + i, post);
        db.post(post, function(err, res) {
            reply(res);
        });
    }
});

server.route({
    method: 'GET',
    path: '/{filename}',
    handler: {
        file: function (request) {
            return request.params.filename;
        }
    }
});

server.start();
