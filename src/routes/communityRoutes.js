const express = require('express');
const router = express.Router();
const { getPosts, createPost, getPostDetails, addComment, likePost } = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/posts')
  .get(getPosts)
  .post(protect, createPost);

router.get('/posts/:id', getPostDetails);
router.post('/posts/:id/comments', protect, addComment);
router.post('/posts/:id/like', protect, likePost);

module.exports = router;
