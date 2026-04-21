import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContactSubmission } from "./contact.schema";
import { CreatePublicContactDto, ContactListQueryDto } from "./dto/contact.dto";

@Injectable()
export class ContactService {
  constructor(
    @InjectModel("ContactSubmission")
    private readonly contactModel: Model<ContactSubmission>,
  ) {}

  private splitName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return { firstName: "Unknown", lastName: "" };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }

  async create(dto: CreatePublicContactDto): Promise<ContactSubmission> {
    const { firstName, lastName } = this.splitName(dto.name);
    const doc = new this.contactModel({
      firstName,
      lastName,
      phone: dto.phone.trim(),
      email: dto.email.trim().toLowerCase(),
      comments: dto.message.trim(),
    });
    return doc.save();
  }

  async findAll(query: ContactListQueryDto): Promise<{
    results: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const sortField = query.sort || "createdAt";
    const direction = query.direction === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: direction };

    const filter: Record<string, unknown> = {};
    if (query.email?.trim()) {
      filter.email = {
        $regex: query.email.trim(),
        $options: "i",
      };
    }

    const [results, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.contactModel.countDocuments(filter).exec(),
    ]);

    return { results: results as Record<string, unknown>[], total, page, limit };
  }
}
