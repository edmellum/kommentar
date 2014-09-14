var React = require('react');
var request = require('superagent');

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

  render: function() {
    console.log(this.props.auth);

    var posts = this.state.posts.map(function(post) {
      return <li>{post.text}</li>;
    });

    return (
      <div>
        <ul className="posts">{posts}</ul>
        <input type="text" ref="input" onKeyDown={this.typed} />
      </div>
    );
  }
});
