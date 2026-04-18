import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { User } from "@/models/user";
import { changePasswordSchema } from "@/schemas/user";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const POST = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { email, currentPassword, newPassword, confirmNewPassword } =
      await req.json();
    await connectToDatabase();
    try {
      const data = await z.parseAsync(changePasswordSchema, {
        email,
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      const user = await User.findOne({ email: data.email });
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
      const isPasswordCorrect = await user.isPasswordCorrect(
        data.currentPassword,
      );
      if (!isPasswordCorrect) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }
      user.password = data.newPassword;
      await user.save();
      return NextResponse.json(
        { message: "Password changed successfully" },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
