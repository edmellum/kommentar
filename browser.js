var Buffer = require('buffer').Buffer;

var React = require('react');
var request = require('superagent');

var hash = require('./hash');
var Kommentar = require('./kommentar');

var el = document.querySelector('.kommentar');

var thread = hash(window.location.pathname);

var timestamp = Date.now();
var auth = {
    timestamp: timestamp,
    user: {
        id: 'olanordmann',
        name: 'Ola Nordmann',
	// Might need to encrypt all this stuff as the page might not
	// always be over SSL.
        email: 'ola.nordmann@norge.no',
        avatar: '//gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=32',
        admin: true
    }
};
// Should be an HMAC appended with timestamp to avoid replays.
var signature = hash('secretgoeshere' + JSON.stringify(auth));
var authHeader = signature + ' ' + new Buffer(JSON.stringify(auth)).toString('base64');

var posts = request
        .get('/threads/'+ thread +'/posts')
        .set('Authorization', authHeader)
        .end(function(res) {
	    var users = {};

            var posts = res.body.map(function(item) {
                if(item.doc.type === 'post') return item.doc;
            }).filter(function(x) { return x != null; });

            res.body.forEach(function(item) {
                if(item.doc.type === 'user') users[item.doc._id] = item.doc;
            });

            var kommentar = Kommentar({
                posts: posts,
		users: users,
                thread: thread,
		currentUser: auth.user,
                auth: authHeader
            });

            React.renderComponent(kommentar, el);
        });

React.renderComponent(Kommentar(), el);
