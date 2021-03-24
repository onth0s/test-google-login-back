const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const User = require('../models/Users.js');
const Token = require('../models/Tokens.js');

const authenticateToken = (req, res, next) => {
	const token = req.headers['authorization'];
	if (!token) return res.sendStatus(401);

	// the callback function takes an error param & the serialized data inside the token
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, serializedData) => {
		if (err) return res.sendStatus(403);

		console.log('\nToken Verified Successfully');
		req.serializedData = serializedData;

		next()
	});
}

const login2 = (req, res) => {
	// authenticate user here
	const { email } = req.body;

	const accesToken = generateAccessToken({ email }, 15);

	const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET);
	const newToken = new Token({ token: refreshToken });
	newToken.save().then(doc => {
		console.log('Token saved successfully!');
	}).catch(err => {
		console.log('Error saving token:');
		console.log(err);
	});

	res.json({ accesToken, refreshToken });
}

const login = async (req, res) => {
	console.log('\nVerifying TokenID...\n');

	const { token, user: { email, firstName, lastName } } = req.body;

	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: process.env.CLIENT_ID
		});

		
		
		User.findOne({ email }).then(doc => {
			if (doc) {
				console.log('User found!');
				console.log('Retrieving data...');
				
				return res.json({
					data: doc.data
				})
			} else {
				console.log(`User '${email}' not found.`);
				console.log(`Creating it...\n`);
	
				const newUser = new User();
				newUser.email = email;
				newUser.name.firstName = firstName;
				newUser.name.lastName = lastName;
	
				newUser.save().then(doc => {
					console.log('New user successfully created!');
					console.log(doc);
				}).catch(err => {
					console.log('Error saving new user: ');
					console.log(err);
				})
			}
		}).catch(err => {
			console.log('Error finding user: ');
			console.log(err);
		});
	} catch (err) {
		console.log('Ticket Verification Error: ');
		console.log(err);
	} 
}

const logout = (req, res) => {
	const { token } = req.body;
	if (!token) return res.sendStatus(403);
	
	Token.findOneAndDelete({ token }).then(doc => {
		if (doc) {
			console.log('Token deleted successfully!');
			res.send('Token deleted successfully!')
			res.status(204).end();
		} else {
			console.log('Token not found');
			res.send('Token not found');
			res.status(204).end();
			return
		}
	}).catch(err => {
		console.log('Error deleting token:');
		console.log(err);
	});
}

const pushArr = (req, res) => {
	const { text, email } = req.body;

	User.findOne({ email }).then(doc => {
		let newData = doc.data;
		newData.unshift(text);

		User.findOneAndUpdate({ email }, {
			data: newData
		}).then(() => {
			console.log(`User '${email}' updated! New data:`);
			console.log(newData);
		}).catch(err => {
			console.log('Error updating user:');
			console.log(err);
		})
	}).catch(err => {
		console.log('Error finding user:');
		console.log(err);
	});
}

const clearOne = (req, res) => {
	const { email, index } = req.body;

	User.findOne({ email }).then(doc => {
		let newData = doc.data;
		newData.splice(index, 1);

		User.findOneAndUpdate({ email }, {
			data: newData
		}).then(() => {
			console.log(`User '${email}' updated! New data:`);
			console.log(newData);
		}).catch(err => {
			console.log('Error updating user:');
			console.log(err);
		})
	}).catch(err => {
		console.log('Error finding user:');
		console.log(err);
	});

	res.sendStatus(200);
}

const clearAll = (req, res) => {
	const { email } = req.body;
	console.log('email:', email);

	User.findOneAndUpdate({ email }, {
		data: []
	}).then(() => {
		console.log('User data cleared!');
	}).catch(err => {
		console.log('Error finding or updating user:');
		console.log(err);
	});

	res.sendStatus(200);
}

const getNewToken = (req, res) => {
	const { token } = req.body;
	if (!token) return res.sendStatus(401);

	Token.findOne({ token }).then(doc => {
		if (doc) {
			console.log('Token found!');

			jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, serializedData) => {
				if (err) res.sendStatus(403);

				const accessToken = generateAccessToken({ email: serializedData.email }, 15);
				res.json({ accessToken });
			});

			res.sendStatus(200);
		} else {
			console.log('Token not found!');
			res.sendStatus(403);
		}
	}).catch(err => {
		console.log('Error finding token:');
		console.log(err);
	});

}



module.exports = {
	login, logout, 
	authenticateToken, getNewToken,
	pushArr,
	clearOne, clearAll
}
