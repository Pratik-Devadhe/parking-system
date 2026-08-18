const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'parkx_super_secret_jwt_key_2026';

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            full_name: user.full_name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.headers['x-auth-token'];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        req.user = decoded;
        next();
    });
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const userRole = (req.user.role || 'DRIVER').toUpperCase();
        const allowedUpper = allowedRoles.map(r => r.toUpperCase());

        if (!allowedUpper.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Authorized roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
            });
        }
        next();
    };
};

module.exports = {
    JWT_SECRET,
    generateToken,
    authenticateToken,
    requireRole
};
