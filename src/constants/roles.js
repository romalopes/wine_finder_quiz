export const ROLES = {
  SUPER_USER: "Super User",
  EDITOR: "Editor",
  REVIEWER: "Reviewer",
  READER: "Reader",
  GUEST: "Guest",
};

// Roles allowed to manage wines & producers (anywhere a Reviewer is
// allowed, an Editor is allowed too).
const WINE_MANAGER_ROLES = [ROLES.SUPER_USER, ROLES.EDITOR];

export function canManageWinesRole(user) {
  return user?.roles.some((role) => WINE_MANAGER_ROLES.includes(role)) ?? false;
}

/**
 * Alias for content-management permission (Super User / Editor / Reviewer):
 * creating articles, reviews, producers, vintages; publishing; seeing
 * draft/management filters.
 */
export const isContentManager = canManageWinesRole;

export function isSuperUser(user) {
  return user?.roles.some((role) => role === ROLES.SUPER_USER) ?? false;
}

export function canManageGrapes(user) {
  return user?.roles.some((role) => role === ROLES.SUPER_USER || role === ROLES.EDITOR) ?? false;
}