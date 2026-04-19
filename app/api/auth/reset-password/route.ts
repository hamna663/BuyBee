import EmailTemplate from "@/components/email-template";
import { connectToDatabase } from "@/config/db";
import { generateOtp } from "@/lib/generateOtp";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { resend } from "@/lib/resend";
import { User } from "@/models/user";
import { passwordResetSchema } from "@/schemas/user";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email || email.trim() === "") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await connectToDatabase();

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!user.isVerified) {
        return NextResponse.json(
          { error: "User is not verified. Verify your email first." },
          { status: 403 },
        );
      }

      const otp = generateOtp();
      user.otp = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: email,
        subject: "Reset your password",
        react: EmailTemplate({
          otp,
          name: user.name,
          subject: "Reset your password",
          type: "reset",
        }),
      });

      if (error) {
        console.error("Error sending email:", error);
        return NextResponse.json(
          { error: "Failed to send OTP email" },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { message: "OTP sent to email" },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error in reset password route:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  },
);

export const POST = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { email, otp, password, confirmPassword } = await req.json();
    await connectToDatabase();
    try {
      const data = await z.parseAsync(passwordResetSchema, {
        email,
        otp,
        password,
        confirmPassword,
      });

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      if (!user.isVerified) {
        return NextResponse.json(
          {
            error: "User is not verified. Verify your email first.",
          },
          {
            status: 403,
          },
        );
      }
      if (!user.otp || !user.otpExpiresAt) {
        return NextResponse.json(
          { error: "OTP not found. Request a new one." },
          { status: 400 },
        );
      }
      if (user.otp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }
      if (user.otpExpiresAt < new Date()) {
        return NextResponse.json(
          { error: "OTP has expired. Request a new one." },
          { status: 400 },
        );
      }
      user.password = data.password;
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return NextResponse.json(
        { message: "Password reset successful" },
        { status: 200 },
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
  },
);
