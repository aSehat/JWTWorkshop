const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const {check, validationResult} = require('express-validator');


// Bringing in the user model
const User = require('../../models/User');

// @route       Post api/users
// @desc        Register user
// @access      Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Please enter a password with 9 or more characters').isLength(
        {min: 9}
    )
], async (req, res) => {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({email});
        if (user) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'User already exists'
                    }
                ]
            });
        }

        user = new User({name, email, password});

        // Encrypt password

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.json({user})

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;