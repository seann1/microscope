Meteor.publish('posts', function(options) {
	check(options, {
		sort: object,
		limit: number
	})
	return Posts.find({}, options);
});

Meteor.publish('comments', function(postId) {
	check(postId, String);
	return Comments.find({postId: postId});
});

Meteor.publish('notifications', function() {
	return Notifications.find({userId: this.userId, read: false});
})