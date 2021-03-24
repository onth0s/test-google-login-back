const express = require('express');
const app = express();

const mongoose = require('mongoose');
require('dotenv').config();

const path = require('path');

mongoose.connect(process.env.MONGO_URI, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
}).then(() => {
	console.log('Mongoose connected successfully!');
}).catch(err => {
	console.log('Mongoose Error: ');
	console.log(err);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(require('cors')());
app.use(require('morgan')('dev'));
app.use(express.json());

app.use('/', require('./routes/routes.js'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`\nLocal Server running at: http://localhost:${PORT}\n`);
});
