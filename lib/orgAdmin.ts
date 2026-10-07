// Clerk's built-in admin role; only admins can export or delete an
// organization. Instances created before Clerk's role keys gained the
// "org:" prefix call it "admin".
const ORG_ADMIN_ROLES = ["org:admin", "admin"];

export const isOrgAdmin = (role: string | null | undefined) =>
  !!role && ORG_ADMIN_ROLES.includes(role);
