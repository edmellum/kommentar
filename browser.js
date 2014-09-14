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
        email: 'ola.nordmann@norge.no',
        avatar: '//gravatar.com/avatar/767fc9c115a1b989744c755db47feb60',
        admin: true
    }
};
// Should be an HMAC appended with timestamp to avoid replays.
var signature = hash('secretgoeshere' + JSON.stringify(auth));

var posts = request
        .get('/threads/'+ thread +'/posts')
        .end(function(res) {
            var data = res.body.map(function(item) {
                return item.doc;
            });
            
            var kommentar = Kommentar({
                posts: data,
                thread: thread,
                auth: signature + ' ' + new Buffer(JSON.stringify(auth)).toString('base64')
            });

            React.renderComponent(kommentar, el);
        });

React.renderComponent(Kommentar(), el);
