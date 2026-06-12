import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";

// Admin credentials come from env — never hardcode credentials in source.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Env-based admin login — works without database
        if (ADMIN_EMAIL && ADMIN_PASSWORD && credentials.email === ADMIN_EMAIL) {
          if (safeCompare(credentials.password, ADMIN_PASSWORD)) {
            return {
              id: "0",
              name: "Admin Pagiverse",
              email: ADMIN_EMAIL,
              role: "admin",
            };
          }
          return null;
        }

        // Database-based auth untuk klien lain
        try {
          const { default: sql } = await import("@/lib/db");
          const users = await sql`
            SELECT id, name, email, password, role, avatar_url
            FROM users
            WHERE email = ${credentials.email}
            LIMIT 1
          `;

          const user = users[0];
          if (!user) return null;

          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar_url,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
