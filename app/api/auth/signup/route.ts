import { connectToDatabase } from "@/config/db";
import { User } from "@/models/user";
import { signUpSchema } from "@/schemas/user";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { name, email, password, confirmPassword } = await req.json();
    const data = await signUpSchema.parseAsync({
      name,
      email,
      password,
      confirmPassword,
    });
    await connectToDatabase();
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 },
      );
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      isAdmin: false,
      isVerified: false,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
