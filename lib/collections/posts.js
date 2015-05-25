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

Meteor.methods({
	postInsert: function(postAttributes) {
		check(this.userId, String);
		check(postAttributes, {
			title: String,
			url: String
		});

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
			submitted: new Date()
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
	}
});