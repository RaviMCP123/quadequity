import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import moment from "moment";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { User } from "../users/user.schema";
import { UsersService } from "../users/users.service";

interface JwtPayload {
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    private usersService: UsersService,
  ) {}

  async generateTokens(userId: string) {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });

    return { accessToken, refreshToken };
  }

  async getPayloadFromToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  async login(
    username: string,
    password: string,
    ipAddress: string,
  ): Promise<User> {
    const user = await this.userModel.findOne({
      email: username,
      role_id: { $in: [1, 2] },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        "Invalid login details.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user._id.toString(),
    );

    await this.userModel.updateOne(
      { _id: user._id },
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
        last_login_at: moment().format("MM ddd, YYYY HH:mm a"),
        ip: ipAddress,
      },
    );
    return await this.usersService.findOne(user._id.toString());
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.getPayloadFromToken(token);
      const { id } = payload;
      const { accessToken, refreshToken } = await this.generateTokens(id);
      await this.userModel.updateOne(
        { _id: id },
        {
          accessToken: accessToken,
          refreshToken: refreshToken,
          last_login_at: moment().format("MM ddd, YYYY HH:mm a"),
        },
      );
      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Token is invalid:", error.message);
      throw new HttpException("Unauthorized", HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
