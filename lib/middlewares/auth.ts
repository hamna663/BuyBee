import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/user";
import { connectToDatabase } from "@/config/db";
import { cookies } from "next/headers";
import { generateTokens } from "../generateTokens";

export const withAuthenticatedUser = (handler: Function) => {
  return async (req: NextRequest, context: any) => {
    await connectToDatabase();
    const incomingAccessToken = req.headers.get("Authorization")?.split(" ")[1];
    if (!incomingAccessToken) {
      const incomingRefreshToken = req.cookies?.get("refreshToken");
      if (!incomingRefreshToken) {
        return NextResponse.json(
          { success: false, message: "authentication failed" },
          { status: 401 },
        );
      }
      try {
        const decodedRefreshToken = jwt.verify(
          incomingRefreshToken.value,
          process.env.REFRESH_TOKEN_SECRET as string,
        ) as jwt.JwtPayload;
        if (
          decodedRefreshToken.exp === undefined ||
          decodedRefreshToken.exp < Math.floor(Date.now() / 1000)
        ) {
          return NextResponse.json(
            { success: false, message: "authentication failed" },
            { status: 401 },
          );
        }
        const userId = decodedRefreshToken.id;
        const user = await User.findById(userId);
        if (!user) {
          return NextResponse.json(
            {
              success: false,
              message: "authentication failed",
            },
            {
              status: 401,
            },
          );
        }
        const { accessToken, refreshToken } = generateTokens(user);
        (await cookies()).set("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          sameSite: "lax",
        });
        req.headers.set("userId", user._id.toString());
        req.headers.set("Authorization", `Bearer ${accessToken}`);
        return handler(req, context);
      } catch (error) {
        return NextResponse.json(
          { success: false, message: "authentication failed" },
          { status: 401 },
        );
      }
    }
    try {
      const decodedAccessToken = jwt.verify(
        incomingAccessToken,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as jwt.JwtPayload;
      if (
        decodedAccessToken.exp === undefined ||
        decodedAccessToken.exp < Math.floor(Date.now() / 1000)
      ) {
        return NextResponse.json(
          { success: false, message: "authentication failed" },
          { status: 401 },
        );
      }
      const user = await User.findById(decodedAccessToken.id);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "authentication failed" },
          { status: 401 },
        );
      }
      req.headers.set("userId", user._id.toString());
      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "authentication failed" },
        { status: 401 },
      );
    }
  };
};
