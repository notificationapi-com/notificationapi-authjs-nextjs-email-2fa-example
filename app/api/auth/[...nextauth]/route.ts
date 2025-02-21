import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import NotificationAPI from "notificationapi-node-server-sdk";

const prisma = new PrismaClient();

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send 2FA code
async function send2FACode(email: string, code: string) {
  NotificationAPI.init(
    process.env.NOTIFICATIONAPI_CLIENT_ID || "",
    process.env.NOTIFICATIONAPI_CLIENT_SECRET || ""
  );

  NotificationAPI.send({
    notificationId: "2fa_code",
    user: {
      id: email,
      email: email,
    },
    mergeTags: {
      code,
    },
  });
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // If no 2FA code provided, generate and send one
        if (!credentials.code) {
          const code = generateCode();
          const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

          await prisma.user.update({
            where: { email: credentials.email },
            data: {
              twoFactorCode: code,
              twoFactorExp: expiration,
            },
          });

          await send2FACode(user.email, code);
          throw new Error("2FA_REQUIRED");
        }

        // Verify 2FA code
        if (user.twoFactorCode !== credentials.code) {
          throw new Error("INVALID_2FA_CODE");
        }

        if (user.twoFactorExp && new Date() > user.twoFactorExp) {
          throw new Error("2FA_CODE_EXPIRED");
        }

        // Clear 2FA code after successful verification
        await prisma.user.update({
          where: { email: credentials.email },
          data: {
            twoFactorCode: null,
            twoFactorExp: null,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Will handle 2FA errors here
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
