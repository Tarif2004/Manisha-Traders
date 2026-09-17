const ownerOnly = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({
      message: "Owner access required.",
    });
  }

  next();
};


// ========================================
// CHECK ADMIN PERMISSION
// ========================================

const requirePermission = (permission) => {
  return (req, res, next) => {

    // Owner has all permissions
    if (req.user.role === "owner") {
      return next();
    }

    // User must be an approved admin
    if (
      req.user.role !== "admin" ||
      req.user.status !== "approved"
    ) {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    // Check requested permission
    if (!req.user.permissions?.[permission]) {
      return res.status(403).json({
        message: `You do not have permission: ${permission}`,
      });
    }

    next();
  };
};


module.exports = {
  ownerOnly,
  requirePermission,
};