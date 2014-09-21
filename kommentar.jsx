var _ = require('underscore');
var React = require('react');
var request = require('superagent');

var Comment = React.createClass({
  likeClick: function(event) {
    event.preventDefault();
    this.props.onLike();
  },

  render: function() {
    var post = this.props.post;
    var user = this.props.user;

    var likeText = this.props.liked ? 'Like' : 'Liked';

    return (
      <article>
        <p>
          {this.props.content}
        </p>
        <div className="comment-meta">
          <img src={user.avatar} />
          by {user.name} <time dateTime={this.props.created.toISOString()}>{this.props.created.toLocaleDateString()}</time>
        </div>
        <a onClick={this.likeClick} href="#">{likeText}</a> - {this.props.likes.length}
      </article>
    );
  }
});

module.exports = React.createClass({
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
      
      return <li><Comment onLike={this.updateLikes.bind(null, post)} likes={post.likes} liked={liked} content={post.text} user={this.props.users[post.userId]} created={created}/></li>;
    }, this);

    return (
      <div>
        <ul className="posts">{posts}</ul>
        <input placeholder="'sup?" type="text" ref="input" onKeyDown={this.typed} />
      </div>
    );
  }
});
