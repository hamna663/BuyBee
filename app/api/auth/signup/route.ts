import { connectToDatabase } from "@/config/db";
import { User } from "@/models/user";
import { signUpSchema } from "@/schemas/user";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { generateOtp } from "@/lib/generateOtp";
import { resend } from "@/lib/resend";
import EmailTemplate from "@/components/email-template";

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

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      otp,
      otpExpiresAt,
      isAdmin: false,
      isVerified: false,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: data.email,
      subject: "Verify your email",
      react: EmailTemplate({
        otp,
        name: data.name,
        subject: "Verify your email",
        type: "verification",
      }),
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
