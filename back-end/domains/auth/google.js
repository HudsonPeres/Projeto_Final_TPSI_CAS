import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Users from "../users/model.js";

const findOrCreateUser = async (profile) => {
  const email = profile.emails[0].value;
  const name = profile.displayName;
  const googleId = profile.id;

  let user = await Users.findOne({ email });
  if (!user) {
    // Criar novo utilizador com role padrão "user"
    user = await Users.create({
      name,
      email,
      googleId,
      password: "",
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }
  return user;
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(profile);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
