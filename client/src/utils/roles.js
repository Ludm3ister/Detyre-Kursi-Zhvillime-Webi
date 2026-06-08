// Roles that get admin-level access in the UI.
// Mirrors the server's ADMIN_ROLES (see server/utils/roles.js).
export const isAdminRole = (role) =>
  role === "admin" || role === "superadmin";

// Whether `actor` is allowed to delete `target`.
// Mirrors the server rules in deleteUser (the real enforcement); this is only
// used to disable the UI button. Both args are user objects.
export const canDeleteUser = (actor, target) => {
  if (!actor || !target) return false;
  if (actor._id === target._id) return false; // can't delete yourself
  if (target.role === "superadmin") return false; // super admins are protected
  if (actor.role === "admin" && target.role === "admin") return false; // admins can't delete admins
  return true;
};
