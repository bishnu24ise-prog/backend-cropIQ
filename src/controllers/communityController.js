const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all community posts
exports.getPosts = async (req, res) => {
  try {
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      const user = await User.findOne();
      if (user) {
        await Post.insertMany([
          { 
            userId: user._id, 
            title: 'Whiteflies on my cotton crop, any organic solutions?', 
            content: 'I\'ve noticed a sudden increase in whiteflies on my 2-month-old cotton crop. Has anyone had success with neem oil?', 
            category: 'Crop Advice',
            likes: 24,
            comments: [{ name: 'Ramesh Singh', text: 'Neem oil (5ml/L) works great!' }]
          }
        ]);
      }
    }
    const posts = await Post.find().populate('userId', 'name phone').sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const post = new Post({ userId: req.userId, title, content, category });
    await post.save();
    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Add comment to a post
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const user = await User.findById(req.userId);
    
    post.comments.push({
      userId: req.userId,
      name: user ? user.name : 'Farmer',
      text: content
    });
    
    await post.save();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.likes = (post.likes || 0) + 1;
    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPostDetails = async (req, res) => {
    const post = await Post.findById(req.params.id).populate('userId', 'name');
    res.json({ post });
};
