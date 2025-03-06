const express = require("express");
const authController = require("../controllers/authController.js");
const userController = require("../controllers/userController.js");
const passport = require('passport');
const jwt = require('jsonwebtoken');  // Import JWT for signing the token

const router = express.Router();

// Google OAuth2 callback route
router.get("/google/callback", passport.authenticate('google'), (req, res) => {
    // If no user is authenticated, redirect to login
    if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }

    // Sign a JWT token for the authenticated user
    const token = signToken(req.user._id);

    // Define cookie options
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // Expiry in days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',  // Ensure cookie is only sent over HTTPS in production
        signed: true,  // Signed cookies for security
    };

    // Send the JWT token in a cookie
    res.cookie('jwt', token, cookieOptions);

    // Remove password from user object before sending it to the client
    req.user.password = undefined;

    // Set the Authorization header with Bearer token
    res.setHeader('Authorization', `Bearer ${token}`);

    // Redirect to the user's profile page with token and user ID as query parameters
    res.redirect(`${process.env.FRONTEND_URL}/user/profile/google?token=${token}&user_id=${req.user._id}`);
});

// Function to sign a JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN, // Set token expiration time
    });
};

module.exports = router;
