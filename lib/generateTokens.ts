import jwt from "jsonwebtoken";
import { UserType } from "@/models/user";

const SECRET: string = process.env.JWT_SECRET!;

export const generateTokens = (user: UserType) => {
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    SECRET,
    {
      expiresIn: "15d",
    },
  );

  const accessToken = jwt.sign(
    {
      id: user.id,
    },
    SECRET,
    {
      expiresIn: "1h",
    },
  );

  return { refreshToken, accessToken };
};
