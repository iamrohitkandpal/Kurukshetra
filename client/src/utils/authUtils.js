export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager'
};

export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN;
};

export const isManager = (user) => {
  return user?.role === ROLES.MANAGER;
};

export const hasPermission = (user, allowedRoles = []) => {
  if (!user || !Array.isArray(allowedRoles)) return false;
  return allowedRoles.includes(user.role);
};

export const getRoleBadgeColor = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return 'danger';
    case ROLES.MANAGER:
      return 'warning';
    default:
      return 'info';
  }
};

export const getRoleIcon = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '⚡';
    case ROLES.MANAGER:
      return '🛡️';
    default:
      return '👤';
  }
};