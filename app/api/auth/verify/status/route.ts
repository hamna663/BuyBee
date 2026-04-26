import { connectToDatabase } from "@/config/db";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || email.trim() === "") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Verification status fetched successfully",
        isVerified: Boolean(user.isVerified),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
};
