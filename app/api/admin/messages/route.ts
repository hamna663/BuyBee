import { connectToDatabase } from "@/config/db";
import { Message } from "@/models/message";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  withAdmin(async () => {
    try {
      await connectToDatabase();
      const messages = await Message.find().sort({ createdAt: -1 });
      return NextResponse.json({ messages });
    } catch (error: unknown) {
      console.log(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }),
);

export const PATCH = withAuthenticatedUser(
  withAdmin(async (req: NextRequest) => {
    try {
      await connectToDatabase();
      const { id, read } = await req.json();

      const message = await Message.findByIdAndUpdate(
        id,
        { read },
        { new: true },
      );

      if (!message) {
        return NextResponse.json(
          { error: "Message not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ message });
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }),
);

export const DELETE = withAuthenticatedUser(
  withAdmin(async (req: NextRequest) => {
    try {
      await connectToDatabase();
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
      }

      await Message.findByIdAndDelete(id);
      return NextResponse.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  }),
);
