Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post) { return ownsDocument(userId, post); },
	remove: function(userId, post) { return ownsDocument(userId, post); }
});

Posts.deny({
	update: function(userId, post, fieldNames) {
		return (_.without(fieldNames, 'url', 'title').length > 0);
	}
});

validatePost = function (post) {
	var errors = {};
	if (!post.title)
		errors.title = "Please fill in a headline";
	if (!post.url)
		errors.url = "please fill in a URL";
	return errors;
};

Meteor.methods({
	postInsert: function(postAttributes) {
		check(this.userId, String);
		check(postAttributes, {
			title: String,
			url: String
		});

		var errors = validatePost(postAttributes);
    	if (errors.title || errors.url)
      		throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

		var postWithSameLink = Posts.findOne({url: postAttributes.url});
		if (postWithSameLink) {
			return {
				postExists: true,
				_id: postWithSameLink._id
			}
		}
		
		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date(),
			commentsCount: 0,
			upvoters: [],
			votes: 0
		});

		var postId = Posts.insert(post);
		return {
			_id: postId
		}
	},

	postUpdate: function(postAttributes) {
		var postWithSameLink = Posts.findOne({url: postAttributes.url});
		//if any url in the database is the same as the url the user just entered
		//and it's not the same url they're trying to change then throw error

		var errors = validatePost(postAttributes);
    	if (errors.title || errors.url)
      		throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");
      	
		if (postWithSameLink && postWithSameLink._id !== postAttributes._id) {
			return {
				postExists: true,
				_id: postWithSameLink._id
			}
		} else {
			Posts.update({_id: postAttributes._id}, {$set: postAttributes});
		}
		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username
		});
		return {
			_id: postAttributes._id
		}
	},
	upvote: function(postId) {
		check(this.userId, String);
		check(postId, String);
		
		var affected = Posts.update({
			_id: postId,
			upvoters: {$ne: this.userId}
		}, {
			$addToSet: {upvoters: this.userId},
			$inc: {votes: 1}
		});
		if (! affected)
			throw new Meteor.Error('invalid', "You weren't able to upvote that post");
	}
});