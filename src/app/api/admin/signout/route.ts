import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

/** Delegates to NextAuth's built-in signout (clears session cookies). */
export { handler as POST, handler as GET };
