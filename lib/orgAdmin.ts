// Clerk's built-in admin role; only admins can export or delete an organization
export const ORG_ADMIN_ROLE = "org:admin";

export const isOrgAdmin = (role: string | null | undefined) =>
  role === ORG_ADMIN_ROLE;
