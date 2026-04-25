import { connectToDatabase } from "@/config/db";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export type RouteContext<T> = {
  params: Promise<T extends string ? Record<T extends `${string}[${infer P}]${string}` ? P : never, string> : T>;
};

export const withAdmin = <T>(
  handler: (req: NextRequest, context: RouteContext<T>) => Promise<NextResponse>,
) => {
  return async (req: NextRequest, context: RouteContext<T>) => {
    await connectToDatabase();
    try {
      const userId = req.headers.get("userId");
      console.log("Admin Middleware - userId from headers:", userId);

      if (!userId) {
        return NextResponse.json(
          { message: "User identity missing from headers" },
          { status: 401 },
        );
      }

      const user = await User.findById(userId);
      console.log("Admin Middleware - User found in DB:", user ? user.email : "Not found");
      console.log("Admin Middleware - User isAdmin status:", user?.isAdmin);

      if (!user) {
        return NextResponse.json(
          {
            message: "User not found in database",
          },
          {
            status: 404,
          },
        );
      }

      if (user.isAdmin === true) {
        return handler(req, context);
      }

      console.warn(`Access denied for user ${user.email} (isAdmin: ${user.isAdmin})`);
      return NextResponse.json(
        {
          message: "Admin access required",
        },
        { status: 403 },
      );
    } catch (error) {
      console.error("Admin Middleware Error:", error);
      return NextResponse.json(
        {
          message: "Internal server error in admin check",
        },
        { status: 500 },
      );
    }
  };
};
