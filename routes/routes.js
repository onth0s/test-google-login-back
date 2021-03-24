const express = require('express');
const router = express.Router();

const { 
	login, logout, 
	pushArr,
	clearOne, clearAll,
	authenticateToken, getNewToken
} = require('../controllers/controllers.js');

// JWT Server
// router.get('/', getPost);
// router.get('/posts', getPost);

// router.post('/login', createPost);

router.delete('/logout', logout);

// // Auth Server
router.post('/login', login);
router.post('/token', getNewToken);
router.post('/push-arr', pushArr);

router.delete('/clear-one', clearOne);
router.delete('/clear-all', clearAll);

module.exports = router;
