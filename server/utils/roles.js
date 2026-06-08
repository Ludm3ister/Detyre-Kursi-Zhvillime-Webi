// Single source of truth for role checks.
// Both "admin" and "superadmin" have admin-level access; "superadmin" is
// additionally protected from deletion (see deleteUser).
export const ADMIN_ROLES = ["admin", "superadmin"];

export const isAdmin = (user) => ADMIN_ROLES.includes(user?.role);
