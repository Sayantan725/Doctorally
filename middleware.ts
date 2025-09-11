export { default } from "next-auth/middleware";

export const config = {
  // Match all routes except /auth/login and /auth/register
  matcher: [
    "/((?!auth/login|auth/register).*)",
  ],
};