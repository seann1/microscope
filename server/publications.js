Meteor.publish('posts', function() {
	return Posts.find();
});

Meteor.publish('posts', function() {
	return Comments.find();
})