/**
 * Role-based access control middleware
 * Provides various middleware functions for controlling access based on user roles
 */

// Define role hierarchy and permissions
const roleHierarchy = {
    superadmin: ['manage_users', 'manage_all', 'view_all', 'manage_inspections', 'view_assigned', 'submit_application', 'view_own', 'manage_system'],
    admin: ['manage_users', 'manage_all', 'view_all', 'manage_inspections', 'view_assigned', 'submit_application', 'view_own'],
    inspector: ['manage_inspections', 'view_assigned'],
    applicant: ['submit_application', 'view_own']
}; 

// Role-based middleware functions
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

    // Permission-based access control
    checkPermissions: (requiredPermissions) => {
        return (req, res, next) => {
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Check if user has all required permissions
            const hasAllPermissions = requiredPermissions.every(perm =>
                roleHierarchy[userRole]?.includes(perm)
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

        if (currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.id === parseInt(requestedUserId)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access forbidden'
        });
    },

    // Check if user is an admin or superadmin
    isAdmin: (req, res, next) => {
        console.log('isAdmin middleware called with user:', {
            id: req.user?.id,
            role: req.user?.role,
            roles: req.user?.roles || 'undefined'
        });

        if (!req.user) {
            console.log('No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            console.log(`User role ${req.user.role} is not admin or superadmin`);
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        console.log('User is admin, access granted');
        next();
    },

    // Check if user is an inspector
    isInspector: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role !== 'inspector') {
            return res.status(403).json({
                success: false,
                message: 'Inspector access required'
            });
        }

        next();
    },

    // Check if user is an applicant
    isApplicant: (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (req.user.role !== 'applicant') {
            return res.status(403).json({
                success: false,
                message: 'Applicant access required'
            });
        }

        next();
    }
};

export default roleMiddleware;
