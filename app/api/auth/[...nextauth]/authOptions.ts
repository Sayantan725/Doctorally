import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

const GUEST_EMAIL =
  process.env.GUEST_EMAIL ||
  process.env.NEXT_PUBLIC_GUEST_EMAIL ||
  "guest@demo.com";

const GUEST_PASSWORD =
  process.env.GUEST_PASSWORD ||
  process.env.NEXT_PUBLIC_GUEST_PASSWORD ||
  "guest123";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectDB();

        // Guest login
        if (
          credentials.email === GUEST_EMAIL &&
          credentials.password === GUEST_PASSWORD
        ) {
          let guestUser = await User.findOne({ email: GUEST_EMAIL });
          if (!guestUser) {
            const hashed = await bcrypt.hash(GUEST_PASSWORD, 10);
            guestUser = await User.create({
              name: "Guest User",
              email: GUEST_EMAIL,
              password: hashed,
            });
          }
          return {
            id: guestUser._id.toString(),
            name: guestUser.name,
            email: guestUser.email,
          };
        }

        // Normal login
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};
