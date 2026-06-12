import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Admin default — bcrypt hash of "Sekaran@207"
const ADMIN_HASH = "$2b$12$KCGfejDH5MpZu76Nz0tQbukjOEeZaa0PFxtfKmNk2vcxfy1iGtZNi";
const ADMIN_EMAIL = "wearecustomjaya@gmail.com";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "pagiverse-studio-fallback-secret-key-32chars",
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

        // Admin hardcoded — email match + bcrypt verify
        if (credentials.email === ADMIN_EMAIL) {
          const valid = await bcrypt.compare(credentials.password, ADMIN_HASH);
          if (valid) {
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
