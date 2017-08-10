var mongoose = require('mongoose');
var connection = mongoose.connection;

mongoose.connect('mongodb://bb2jake:unlimited@ds058369.mlab.com:58369/slapgame', {
	server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
	replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
});

connection.on('error', err => {
	console.error('Something failed when connecting to mlab', err);
});

connection.once('open', () => {
	console.log('Connected to mlab');
});