import bcrypt from "bcryptjs";
import mongoose, { Model, Schema } from "mongoose";

type UserType = {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  accessToken?: string;
  refreshToken?: string;
  isPasswordCorrect?: (password: string) => Promise<boolean>;
};

const userSchema = new Schema<UserType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.method("isPasswordCorrect", async function (password: string) {
  return await bcrypt.compare(password, this.password);
});

export const User: Model<UserType> =
  mongoose.models.User || mongoose.model<UserType>("User", userSchema);
