module.exports= function(io) {
	io.on('connection', (socket) =>{
		// console.log('A user is connected');
		console.log('hello world im a hot socket');
		socket.on('friendRequest', (friend, callback)=> {
			// console.log(friend.sender+ " "+ friend.receiver);
			io.to(friend.receiver).emit('newFriendRequest', {
				from: friend.sender,
				to: friend.receiver
			});
			callback();
		});
	});
}