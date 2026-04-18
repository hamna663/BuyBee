import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    req.cookies?.delete("refreshToken");
    req.headers?.delete("Authorization");
    req.headers?.delete("userId");
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );
    response.cookies.delete("refreshToken");
    response.headers.delete("Authorization");
    response.headers.delete("userId");
    return response;
  },
);
