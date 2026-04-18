import { connectToDatabase } from "@/config/db";
import { generateTokens } from "@/lib/generateTokens";
import { User } from "@/models/user";
import { signInSchema } from "@/schemas/user";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const { email, password } = await req.json();

    const data = await z.parseAsync(signInSchema, { email, password });

    await connectToDatabase();
    const user = await User.findOne({ email: data.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found! Try Signing up instead." },
        { status: 400 },
      );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(data.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Wrong email or password" },
        { status: 400 },
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          error:
            "Email not verified! Please verify your email before signing in.",
        },
        { status: 400 },
      );
    }

    const { accessToken, refreshToken } = generateTokens(user);

    (await cookies()).set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      sameSite: "lax",
    });

    return NextResponse.json(
      {
        message: "User signed in successfully",
        accessToken,
        refreshToken,
      },
      {
        status: 200,
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      },
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
