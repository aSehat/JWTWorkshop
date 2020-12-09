const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

const Post = require('../../models/Post');



// @route       POST api/posts
// @desc        Create a post
// @access      Public
router.post('/', [
    [check('text', 'Text is required').not().isEmpty()]
], async (req, res) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {

        const newPost = new Post({text: req.body.text});

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       GET api/posts
// @desc        Get all post
// @access      Public

router.get('/', async (req, res) => {
    try { // Finding all and then sorting by newest first
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route       DELETE api/posts/:id
// @desc        Delete a post
// @access      Public

router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (! post) {
            return res.status(404).json({msg: 'Post not found'});
        }

        await post.remove();

        res.json({msg: 'Post removed'});
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;
