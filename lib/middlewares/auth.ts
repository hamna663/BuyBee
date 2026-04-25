import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/user";
import { connectToDatabase } from "@/config/db";
import { cookies } from "next/headers";
import { generateTokens } from "../generateTokens";

import { RouteContext } from "./admin";

export const withAuthenticatedUser = <T>(
  handler: (req: NextRequest, context: RouteContext<T>) => Promise<NextResponse>,
) => {
  return async (
    req: NextRequest,
    context: RouteContext<T>,
  ): Promise<NextResponse> => {
    await connectToDatabase();

    const incomingAccessToken = req.headers.get("Authorization")?.split(" ")[1];

    // Function to attempt token refresh
    const attemptRefresh = async () => {
      const incomingRefreshToken = req.cookies?.get("refreshToken");
      if (!incomingRefreshToken) {
        return null;
      }

      try {
        const decodedRefreshToken = jwt.verify(
          incomingRefreshToken.value,
          process.env.REFRESH_TOKEN_SECRET as string,
        ) as jwt.JwtPayload;

        if (
          !decodedRefreshToken.exp ||
          decodedRefreshToken.exp < Math.floor(Date.now() / 1000)
        ) {
          return null;
        }

        const user = await User.findById(decodedRefreshToken.id);
        if (!user) return null;

        const { accessToken, refreshToken } = generateTokens(user);

        // Update cookie
        (await cookies()).set("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          sameSite: "lax",
        });

        // Set headers for downstream
        req.headers.set("userId", user._id.toString());
        req.headers.set("Authorization", `Bearer ${accessToken}`);

        return user;
      } catch {
        return null;
      }
    };

    // 1. If no token or "null"/"undefined" strings, try refresh
    if (
      !incomingAccessToken ||
      incomingAccessToken === "null" ||
      incomingAccessToken === "undefined"
    ) {
      const refreshedUser = await attemptRefresh();
      if (refreshedUser) {
        return handler(req, context);
      }
      return NextResponse.json(
        { success: false, message: "authentication failed" },
        { status: 401 },
      );
    }

    // 2. Try verifying access token
    try {
      const decodedAccessToken = jwt.verify(
        incomingAccessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as jwt.JwtPayload;

      // Check expiration manually just in case jwt.verify doesn't throw (depending on config)
      if (
        !decodedAccessToken.exp ||
        decodedAccessToken.exp < Math.floor(Date.now() / 1000)
      ) {
        throw new Error("Token expired");
      }

      const user = await User.findById(decodedAccessToken.id);
      if (!user) {
        // User might have been deleted, try refresh or fail
        const refreshedUser = await attemptRefresh();
        if (refreshedUser) return handler(req, context);
        return NextResponse.json(
          { success: false, message: "authentication failed" },
          { status: 401 },
        );
      }

      req.headers.set("userId", user._id.toString());
      return handler(req, context);
    } catch (error: unknown) {
      // 3. If access token verification fails (e.g. expired), try refresh
      console.log(
        "Auth Middleware - Access token invalid, attempting refresh. Error:",
        (error as Error).message,
      );
      const refreshedUser = await attemptRefresh();
      if (refreshedUser) {
        return handler(req, context);
      }

      console.error("Auth Middleware - Both tokens failed.");
      return NextResponse.json(
        { success: false, message: "authentication failed" },
        { status: 401 },
      );
    }
  };
};
