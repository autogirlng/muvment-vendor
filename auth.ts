import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
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
          const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (res.ok && data.status === "SUCCESSFUL" && data.data) {
            // Strip out large unneeded fields and duplicates to keep the JWT size small
            const { accessibleRoutes, organizations, vendors, ...cleanedRawData } = data.data;

            return {
              id: data.data.userId,
              name: `${data.data.firstName} ${data.data.lastName}`,
              email: data.data.email,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              vendors: data.data.vendors || [],
              userType: data.data.userType,
              rawData: cleanedRawData,
            };
          }

          throw new Error(data.message || "Invalid credentials");
        } catch (error: any) {
          throw new Error(error.message || "Login failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user = user.rawData;
        token.vendors = user.vendors;
      }

      // Handle manual token refresh via update()
      if (trigger === "update" && session?.accessToken) {
        token.accessToken = session.accessToken;
        if (session.refreshToken) {
          token.refreshToken = session.refreshToken;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      // Expose tokens and user data to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = token.user;
      session.vendors = token.vendors;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "FDrGED/rt0eIB17PWxUCQRDEl2DOpGjxNRztAKpnV150q0v1gRJ79Oa7Gck=",
  trustHost: true,
});
