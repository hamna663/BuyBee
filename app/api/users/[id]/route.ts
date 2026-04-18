import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { User } from "@/models/user";
import { NextResponse, NextRequest } from "next/server";

export const GET = withAuthenticatedUser(
  withAdmin(async (req: NextRequest, ctx: RouteContext<"/api/users/[id]">):Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const { id } = await ctx.params;
      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 },
      );
    }
  }),
);

export const DELETE = withAuthenticatedUser(
  withAdmin(async (req: NextRequest, ctx: RouteContext<"/api/users/[id]">):Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const { id } = await ctx.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(
        { message: "User deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 },
      );
    }
  }),
);
