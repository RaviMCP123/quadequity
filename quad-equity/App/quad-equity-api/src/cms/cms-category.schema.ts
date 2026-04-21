import { Schema, Document, Types } from "mongoose";

export interface PlacementItem {
  type: "header" | "footer" | "banner" | "quicklinks";
  sortOrder: number;
}

export interface CmsCategory extends Document {
  name: string;
  slug?: string;
  placement?: PlacementItem[];
  manager?: Types.ObjectId | null;
  sortOrder: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CmsCategorySchema = new Schema<CmsCategory>(
  {
    name: {
      type: String,
      required: true,
      maxlength: 250,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      lowercase: true,
      trim: true,
    },
    placement: {
      type: [
        {
          type: {
            type: String,
            enum: ["header", "footer", "banner", "quicklinks"],
            required: true,
          },
          sortOrder: {
            type: Number,
            required: true,
            default: 0,
          },
        },
      ],
      default: [],
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "AccountHolder",
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Indexes for better query performance
CmsCategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
CmsCategorySchema.index({ "placement.type": 1 }); // Index for querying by placement type
CmsCategorySchema.index({ status: 1 });
CmsCategorySchema.index({ sortOrder: 1 });
CmsCategorySchema.index({ manager: 1 });

CmsCategorySchema.set("toJSON", { virtuals: true });
CmsCategorySchema.set("toObject", { virtuals: true });

export default CmsCategorySchema;
