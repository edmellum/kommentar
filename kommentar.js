/** @jsx React.DOM */
var _ = require('underscore');
var React = require('react');
var request = require('superagent');

var Comment = React.createClass({displayName: 'Comment',
  likeClick: function(event) {
    event.preventDefault();
    this.props.onLike();
  },

  render: function() {
    var post = this.props.post;
    var user = this.props.user;

    var likeText = this.props.liked ? 'Like' : 'Liked';

    return (
      React.DOM.article(null, 
        React.DOM.p(null, 
          this.props.content
        ), 
        React.DOM.div({className: "comment-meta"}, 
          React.DOM.img({src: user.avatar}), 
          "by ", user.name, " ", React.DOM.time({dateTime: this.props.created.toISOString()}, this.props.created.toLocaleDateString())
        ), 
        React.DOM.a({onClick: this.likeClick, href: "#"}, likeText), " - ", this.props.likes.length
      )
    );
  }
});

module.exports = React.createClass({displayName: 'exports',
  getDefaultProps: function() {
    return {
      posts: [],
      thread: ''
    };
  },

  getInitialState: function() {
    return {
      posts: this.props.posts
    };
  },

  componentWillReceiveProps: function(next) {
    this.setState({posts: next.posts});
  },

  typed: function(event) {
    if(event.keyCode == 13) {
      var el = this.refs.input.getDOMNode();
      var value = el.value;
      el.value = '';

      var post = {
        text: value,
	userId: this.props.currentUser.id,
        createdAt: new Date()
      };
      
      request
        .post('/threads/'+ this.props.thread + '/posts')
        .set('Authorization', this.props.auth)
        .send(post)
        .end(function(res) {
          console.log(res);
        });

      this.setState({posts: this.state.posts.concat([post])});
    }
  },

  updateLikes: function(likedPost) {
    var threadId = likedPost.threadId;
    var userId = this.props.currentUser.id;

    var newPosts = this.state.posts.map(function(post) {
      if(likedPost.id == post.id) {
	var existing = post.likes.indexOf(userId);
	if(existing !== -1) {
	  post.likes.splice(existing);
	} else {
          post.likes.push(userId);
	}
	likedPost = post;
      }
      return post;
    }, this);

    request
      .put('/threads/'+ this.props.thread + '/posts/' + likedPost._id)
      .set('Authorization', this.props.auth)
      .send(likedPost)
      .end(function(res) {
        console.log(res);
      });
    
    this.setState({posts: newPosts});
  },

  render: function() {
    console.log(this.props.auth);

    var posts = this.state.posts.map(function(post) {
      var liked = post.likes.indexOf(this.props.currentUser.id) === -1;
      var created = new Date(post.createdAt);
      
      return React.DOM.li(null, Comment({onLike: this.updateLikes.bind(null, post), likes: post.likes, liked: liked, content: post.text, user: this.props.users[post.userId], created: created}));
    }, this);

    return (
      React.DOM.div(null, 
        React.DOM.ul({className: "posts"}, posts), 
        React.DOM.input({placeholder: "'sup?", type: "text", ref: "input", onKeyDown: this.typed})
      )
    );
  }
});
