const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
		unique: true
	}
}, { timestamps: true });
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
