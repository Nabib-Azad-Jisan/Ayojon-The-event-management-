const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  let token = req.header('x-auth-token');
  if (!token && req.header('authorization')) {
    // Support Bearer token
    const authHeader = req.header('authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
    }
  }

  // Check if no token
  if (!token) {
    console.error('No token found in request headers');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);
    req.user = decoded;
    if (!req.user.userId) {
      console.warn('Decoded token does not contain userId:', decoded);
    }
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 