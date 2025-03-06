const session = require("express-session");
const passport = require('passport');
const OAuth2Strategy = require('passport-google-oauth2').Strategy;
const User = require("../models/userModal");

const passportUtil = app => {
  app.use(
    session({
      secret: '45875632155sdfds4545dsfsf5s', 
      resave: false,
      saveUninitialized: true,
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wedding-node.vercel.app/api'
  : process.env.API_BASE_URL || 'http://localhost:8000/api'


  passport.use(
    new OAuth2Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.REDIRECT_URL}`,
        scope: ["profile", "email"], // You can add more scopes here as needed
      },
      async (accessToken, refreshToken, profile, done) => {
       
        // Error handling: check for errors and pass them to callback
        try{
         
            let user = await User.findOne({ email: profile.emails[0].value });
            if(!user){
                user = await User.create({
                    name:profile.displayName,
                    email:profile.emails[0].value,
                    password:generatePassword(8),
                    image:profile.picture
                })
            }
          
            done(null, user);
        }
        catch (error) {
            done(error, null);
          }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id); // Store only essential data
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
};

module.exports = passportUtil;


function generatePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
  
    return password;
  }