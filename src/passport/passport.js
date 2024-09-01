import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { TOKEN_SECRET } from '../config.js';
import User from '../models/user.model.js'; 

const extractJwtFromCookies = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.token;
    }
    return token;
};

const options = {
    jwtFromRequest: extractJwtFromCookies,
    secretOrKey: TOKEN_SECRET,
};

passport.use(
    new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            const user = await User.findById(jwt_payload.id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error('Passport error:', error);
            return done(error, false);
        }
    })
);

export default passport;