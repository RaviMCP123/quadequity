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

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    if (query.name?.trim()) {
      const normalizedName = query.name.trim().replace(/\s+/g, " ");
      const escapedName = this.escapeRegex(normalizedName);
      filter.$or = [
        {
          firstName: {
            $regex: escapedName,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: escapedName,
            $options: "i",
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $trim: {
                  input: { $concat: ["$firstName", " ", "$lastName"] },
                },
              },
              regex: escapedName,
              options: "i",
            },
          },
        },
      ];
    }
    if (query.email?.trim()) {
      filter.email = {
        $regex: query.email.trim(),
        $options: "i",
      };
    }
    if (query.createdAt?.trim()) {
      const [start, end] = query.createdAt.split("TO");
      if (start && end) {
        const startDate = new Date(`${start}T00:00:00.000Z`);
        const endDate = new Date(`${end}T23:59:59.999Z`);

        if (
          !Number.isNaN(startDate.getTime()) &&
          !Number.isNaN(endDate.getTime())
        ) {
          filter.createdAt = {
            $gte: startDate,
            $lte: endDate,
          };
        }
      }
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
