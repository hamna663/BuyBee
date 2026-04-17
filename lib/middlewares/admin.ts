import { connectToDatabase } from "@/config/db";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export const withAdmin = (handler: Function) => {
  return async (req: NextRequest, context: any) => {
    await connectToDatabase();
    try {
      const user = await User.findById(req.headers.get("userId"));
      if (!user) {
        return NextResponse.json(
          {
            message: "User not found!",
          },
          {
            status: 404,
          },
        );
      }
      if (user.isAdmin) {
        return handler(req, context);
      }
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 403 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Something went wrong!",
        },
        { status: 500 },
      );
    }
  };
};
