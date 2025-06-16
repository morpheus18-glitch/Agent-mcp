import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { query } from "./db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if we're in development mode with mock users
          if (process.env.NODE_ENV === "development") {
            // Mock users for development
            if (
              credentials.email === "user@example.com" &&
              credentials.password === "password"
            ) {
              return {
                id: "1",
                email: "user@example.com",
                name: "Demo User",
                role: "user",
              };
            }

            if (
              credentials.email === "admin@example.com" &&
              credentials.password === "admin"
            ) {
              return {
                id: "2",
                email: "admin@example.com",
                name: "Admin User",
                role: "admin",
              };
            }
          }

          // Real database authentication
          const result = await query(
            "SELECT id, email, full_name, password_hash, role FROM users WHERE email = $1 AND is_active = true",
            [credentials.email],
          );

          const user = result.rows[0];

          if (!user) {
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password_hash,
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await query("UPDATE users SET last_login = NOW() WHERE id = $1", [
            user.id,
          ]);

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
