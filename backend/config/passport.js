import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const configurePassport = (passport) => {
  // Google OAuth 2.0 Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link the Google account to the existing local account
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // Create a new user
      const newUser = new User({
        googleId: profile.id,
        fullName: profile.displayName,
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0], // Or generate a unique username
        authProvider: 'google',
        // You might want to set a default gender or handle it differently
        gender: 'male', // Placeholder
        profilePicture: profile.photos[0].value,
      });

      await newUser.save();
      done(null, newUser);
    } catch (error) {
      done(error, false);
    }
  }));

  // JWT Strategy for protecting routes
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));

  // Serialize and deserialize user instances to and from the session.
  passport.serializeUser((user, done) => {
    done(null, user.id);
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

export default configurePassport;
