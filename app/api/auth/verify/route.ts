import EmailTemplate from "@/components/email-template";
import { connectToDatabase } from "@/config/db";
import { generateOtp } from "@/lib/generateOtp";
import { resend } from "@/lib/resend";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  res: NextResponse,
): Promise<NextResponse> => {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email || email === "") {
      return NextResponse.json(
        {
          message: "Email is required",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const { data, error } = await resend.emails.send({
      from: "BuyBee <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      react: EmailTemplate({
        otp,
        name: user.name,
        subject: "Verify your email",
        type: "verification",
      }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { message: "Failed to send OTP email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "OTP sent to email" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
};
export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
    if (user.otpExpiresAt && user.otpExpiresAt <= new Date()) {
      return NextResponse.json({ message: "OTP has expired" }, { status: 400 });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
};
