import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcryptjs";
import { Model } from "mongoose";
import { User } from "./user.schema";
import { AuditLog } from "../audit-log/audit-log.schema";
import { Query } from "../interface/common";
import { CreateAuditLogDto } from "../audit-log/dto/audit-log.dto";
import { UpdateProfileDto, UpdateNotificationDto } from "./dto/user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel("AuditLog")
    private auditLogModel: Model<AuditLog>,
  ) {}

  async findOne(id: string): Promise<User | undefined> {
    return await this.userModel
      .findOne({ _id: id })
      .select(
        "firstName lastName mobile_number username email password image last_login_at ip accessToken refreshToken role_id notification permission",
      );
  }

  async findUser(id: string, select: string): Promise<User | undefined> {
    return await this.userModel.findOne({ _id: id }).select(select);
  }

  async getActiveUser(id: string): Promise<User | undefined> {
    return await this.userModel
      .findOne({ _id: id, status: true })
      .select("id role_id");
  }

  async userAccountActiveToken(accessToken: string): Promise<User | undefined> {
    return await this.userModel
      .findOne({ accessToken: accessToken, status: true })
      .select("id");
  }

  async updateProfile(request: UpdateProfileDto, userId: string) {
    const updateData: UpdateProfileDto = {} as UpdateProfileDto;
    if (request.firstName !== undefined)
      updateData.firstName = request.firstName;
    if (request.lastName !== undefined) updateData.lastName = request.lastName;
    if (request.email !== undefined) updateData.email = request.email;
    if (request.mobile_number !== undefined)
      updateData.mobile_number = request.mobile_number;

    await this.userModel.updateOne({ _id: userId }, { $set: updateData });
  }

  async findAdminDetail(id: string): Promise<User | undefined> {
    return await this.userModel
      .findOne({ _id: id, is_delete: false })
      .select(
        "firstName lastName email mobile_number image role_id status permission",
      );
  }

  async updateAdminProfileById(
    request: {
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile_number?: string;
      permission?: string[];
    },
    userId: string,
  ) {
    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      mobile_number?: string;
      permission?: string[];
    } = {};

    if (request.firstName !== undefined) updateData.firstName = request.firstName;
    if (request.lastName !== undefined) updateData.lastName = request.lastName;
    if (request.email !== undefined) updateData.email = request.email;
    if (request.mobile_number !== undefined)
      updateData.mobile_number = request.mobile_number;
    if (request.permission !== undefined) updateData.permission = request.permission;

    await this.userModel.updateOne({ _id: userId }, { $set: updateData });
  }

  async updatePassword(
    request: {
      currentPassword: string;
      password: string;
    },
    userId: string,
  ) {
    const user = await this.findOne(userId);
    if (
      !user ||
      !(await bcrypt.compare(request.currentPassword, user.password))
    ) {
      throw new HttpException(
        "Current password does not match. Please try again.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);
    await this.userModel.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
      },
    );
  }

  async updateProfileImage(image: string, userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        image: image,
      },
    );
  }

  async updatePasswordByAdmin(password: string, userId: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
      },
    );
  }

  async findCount(id: number): Promise<number> {
    return await this.userModel.countDocuments({
      role_id: id,
      is_delete: false,
    });
  }

  async deleteAccount(userId: string) {
    return this.userModel.updateOne(
      { _id: userId },
      {
        is_delete: true,
        accessToken: "",
        refreshToken: "",
        status: false,
        last_login_at: null,
        ip: "",
      },
    );
  }

  async findOneByQuery(query: Query, select: string) {
    return this.userModel.findOne(query).select(select);
  }

  async findAllByQuery(query: Query, select: string) {
    return this.userModel.find(query).select(select);
  }

  async createAudit(request: CreateAuditLogDto): Promise<boolean> {
    const newEntity = new this.auditLogModel(request);
    await newEntity.save();
    return true;
  }

  async findProfile(id: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id })
      .select(
        "firstName mobile_number userId image accessToken refreshToken notification mood language dob age gender bio is_verify email",
      );
    return user;
  }

  async updateNotification(payload: UpdateNotificationDto, userId: string) {
    await this.userModel.updateOne({ _id: userId }, payload);
  }
}
