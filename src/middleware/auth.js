import jwt from 'jsonwebtoken';
import User from '../model/Auth/auth.js';

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

function requireVolunteer(req, res, next) {
  if (!req.user || req.user.role !== "volunteer") {
    return res.status(403).json({ message: 'Volunteer access required' });
  }
  next();
}

function requireAdminOrVolunteer(req, res, next) {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "volunteer")) {
    return res.status(403).json({ message: 'Admin or Volunteer access required' });
  }
  next();
}

export { requireAuth, requireAdmin, requireVolunteer, requireAdminOrVolunteer };


