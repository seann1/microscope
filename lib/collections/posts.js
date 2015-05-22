Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post) { return ownsDocument(userId, post); },
	remove: function(userId, post) { return ownsDocument(userId, post); }
});

Meteor.methods({
	postInsert: function(postAttributes) {
		check(this.userId, String);
		check(postAttributes, {
			title: String,
			url: String
		});
		
		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date()
		});

		var postId = Posts.insert(post);
		return {
			_id: postId
		};
	}
});