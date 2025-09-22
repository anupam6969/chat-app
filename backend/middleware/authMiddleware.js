const jwt = require('jsonwebtoken');
const user = require('../models/user');

const protectRoute = async (req, res, next) => {

    try {

        const token = req.cookies.jwt;
        console.log(req);
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }

        const foundUser = await user.findById(decoded.userId).select('-password');

        if (!foundUser) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        req.user = foundUser;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }

};
module.exports = protectRoute;
