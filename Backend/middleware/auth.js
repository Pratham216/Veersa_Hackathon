const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { JWT_SECRET } = require('../crypto');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // And replace it with:
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Convert string ID to ObjectId if needed
    let userId;
    try {
      // Check if userId or id is present in decoded token
      const id = decoded.userId || decoded.id;
      if (!id) {
        throw new Error('No user ID in token');
      }
      userId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.error('Error converting user ID to ObjectId:', error);
      return res.status(401).json({ message: 'Invalid user ID format' });
    }
    
    // Add user data to request
    req.user = {
      id: userId,
      userType: decoded.userType,
      email: decoded.email
    };
    
    console.log('Auth middleware - User authenticated:', {
      id: userId.toString(),
      userType: decoded.userType,
      email: decoded.email
    });
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};