// Admin middleware to check if the user is an admin

const adminMiddleware = (req, res, next) => {
  // authMiddleware should be used before this to populate req.user
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Admin rights required.'
    });
  }
  next();
};

export default adminMiddleware;