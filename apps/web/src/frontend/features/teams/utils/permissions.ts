import type { TeamRole } from "../schemas";

export function canManageTeam(role: TeamRole | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canDeleteTeam(role: TeamRole | undefined): boolean {
  return role === "owner";
}

export function canManageMembers(role: TeamRole | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function canChangeRole(
  currentUserRole: TeamRole | undefined,
  targetMemberRole: TeamRole,
  newRole: TeamRole
): boolean {
  if (targetMemberRole === "owner" || newRole === "owner") {
    return currentUserRole === "owner";
  }
  return canManageMembers(currentUserRole);
}

export function canRemoveMember(
  currentUserRole: TeamRole | undefined,
  targetMemberRole: TeamRole
): boolean {
  if (targetMemberRole === "owner") {
    return currentUserRole === "owner";
  }
  return canManageMembers(currentUserRole);
}
