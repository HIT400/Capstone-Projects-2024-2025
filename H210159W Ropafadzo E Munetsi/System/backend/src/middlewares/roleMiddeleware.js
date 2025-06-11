const roleMiddleware = {
  // Basic role requirement check
  requireRole: (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user?.role) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access forbidden. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    };
  },

  // Role-based access control with permissions
  checkPermissions: (requiredPermissions) => {
    return (req, res, next) => {
      // Define role permissions (would normally come from a database)
      const rolePermissions = {
        admin: ['manage_users', 'manage_all', 'view_all'],
        inspector: ['manage_inspections', 'view_assigned'],
        applicant: ['submit_application', 'view_own']
      };

      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(perm => 
        rolePermissions[userRole]?.includes(perm)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    };
  },

  // Self-or-higher role check (user can access their own data or admin can access)
  selfOrAdmin: (req, res, next) => {
    const requestedUserId = req.params.userId || req.body.userId;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (currentUser.role === 'admin' || currentUser.userId === requestedUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access forbidden'
    });
  }
};

export default roleMiddleware;