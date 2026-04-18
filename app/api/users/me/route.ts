import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    await connectToDatabase();
    try {
      console.log(req.headers.get("userId"));
      const user = await User.findById(req.headers.get("userId"));
      if (!user) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          { status: 404 },
        );
      }
      return NextResponse.json(
        {
          message: "User data fetched successfully",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "An error occurred while fetching user data",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const { name } = await req.json();
      if (!name || name.trim() === "") {
        return NextResponse.json(
          {
            message: "Name is required",
          },
          { status: 400 },
        );
      }
      const user = await User.findByIdAndUpdate(
        req.headers.get("userId"),
        { name },
        { new: true },
      );
      if (!user) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          message: "User data updated successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "An error occurred while updating user data",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const user = await User.findByIdAndDelete(req.headers.get("userId"));
      if (!user) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          { status: 404 },
        );
      }
      return NextResponse.json(
        {
          message: "User account deleted successfully",
        },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "An error occurred while deleting user account",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      );
    }
  },
);
