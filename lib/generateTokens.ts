import jwt from "jsonwebtoken";
import { UserType } from "@/models/user";

const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_SECRET: string = process.env.ACCESS_TOKEN_SECRET!;
export const generateTokens = (user: UserType) => {
  const refreshToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "15d",
    }
  );

  const accessToken = jwt.sign(
    {
      id: user.id,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );

  return { refreshToken, accessToken };
};
