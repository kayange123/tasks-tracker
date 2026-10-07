export {};

declare global {
  // Present when the Clerk session token is customized with
  // { "metadata": "{{user.public_metadata}}" }
  interface CustomJwtSessionClaims {
    metadata?: { role?: string };
  }
}
