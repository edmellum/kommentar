var stream = require('stream');

var _ = require('underscore');
var Hapi = require('hapi');
var React = require('react');
var level = require('levelup');
var PouchDB = require('pouchdb');
var JSONStream = require('JSONStream');

var hash = require('./hash');
var Kommentar = require('./kommentar');

var server = new Hapi.Server('localhost', 8000);

var i = 0;
var db = new PouchDB('kommentar');

var threadPosts = function(doc) {
  if(doc.type === 'post') {
    emit(doc.createdAt);
    emit(doc.createdAt, {_id: doc.userId});
  }
};

var likeCount = {
  map: function(doc) {
    if(doc.type === 'like') emit(doc.userId);
  },
  reduce: '_count'
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
    var authHeader = req.headers.authorization.split(' ');
    var signature = authHeader[0];
    var auth = new Buffer(authHeader[1], 'base64').toString('ascii');
    var check = hash('secretgoeshere' + check);
    console.log(signature, check, signature === check);

    var user = JSON.parse(auth).user;
    user.type = 'user';
    var id = user.id;
    delete user.id;

    db.allDocs({include_docs: true}, function(err, res) {
    });

    db.get(id, function(err, doc) {
      if(doc) {
	console.log(doc);
	db.put(user, id, doc._rev, function(err, res) {
	  if(err) throw err;
	});
      } else {
	db.put(user, id, function(err, res) {
	  if(err) throw err;
	});
      }

      db.query({map: threadPosts}, {include_docs: true}, function(err, res) {
	res.rows
	reply(res.rows);
      });
    });
  }
});

// Should be a PUT for new posts where we'll just make a GUID on the
// client.
server.route({
  method: 'POST',
  path: '/threads/{threadId}/posts',
  handler: function(req, reply) {
    var authHeader = req.headers.authorization.split(' ');
    var auth = new Buffer(authHeader[1], 'base64').toString('ascii');
    var user = JSON.parse(auth).user;

    var post = {
      type: 'post',
      text: req.payload.text,
      userId: user.id,
      threadId: req.params.threadId,
      createdAt: Date.now(),
      likes: []
    };

    db.post(post, {include_docs: true}, function(err, res) {
      reply(res);
    });
  }
});

server.route({
  method: 'PUT',
  path: '/threads/{threadId}/posts/{postId}',
  handler: function(req, reply) {
    var authHeader = req.headers.authorization.split(' ');
    var auth = new Buffer(authHeader[1], 'base64').toString('ascii');
    var user = JSON.parse(auth).user;
    var likes = req.payload.likes || [];

    var post = {
      type: 'post',
      text: req.payload.text,
      userId: user.id,
      threadId: req.params.threadId,
      createdAt: Date.now(),
      likes: _.uniq(_.compact(likes))
    };

    delete post.id;

    db.get(req.params.postId, function(err, res) {
      db.put(post, res._id, res._rev, function(err, res) {
        reply(res);
      });
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
