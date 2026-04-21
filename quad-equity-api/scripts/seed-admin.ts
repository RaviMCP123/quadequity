/**
 * Seeds or updates the CMS super-admin user (role_id 1).
 * Reads DATABASE_URL from `.env`; credentials from env or defaults.
 *
 * Usage: npm run seed:admin
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";
import UserSchema from "../src/users/user.schema";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DEFAULT_EMAIL = "admin@quad-equity.local";
const DEFAULT_PASSWORD = "Admin@12345";

function envOr(key: string, fallback: string): string {
  const v = process.env[key];
  return v != null && String(v).trim() !== "" ? String(v).trim() : fallback;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const email = envOr("SEED_ADMIN_EMAIL", DEFAULT_EMAIL).toLowerCase();
  const password = envOr("SEED_ADMIN_PASSWORD", DEFAULT_PASSWORD);
  const firstName = envOr("SEED_ADMIN_FIRST_NAME", "Admin");
  const lastName = envOr("SEED_ADMIN_LAST_NAME", "User");
  const mobile = envOr("SEED_ADMIN_MOBILE", "0000000000");

  /** Avoid overloaded union typings from `mongoose.models.User | ...`. */
  const UserModel =
    (mongoose.models.User ??
      mongoose.model("User", UserSchema)) as mongoose.Model<mongoose.Document>;

  await mongoose.connect(databaseUrl);

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await UserModel.updateOne(
    { email },
    {
      $set: {
        email,
        password: passwordHash,
        firstName,
        lastName,
        mobile_number: mobile,
        role_id: 1,
        status: true,
        is_delete: false,
        is_verify: true,
        notification: false,
        permission: [],
        accessToken: "",
        refreshToken: "",
      },
    },
    { upsert: true },
  );

  if (!result.acknowledged) {
    throw new Error("Database did not acknowledge the upsert");
  }

  console.log("[seed:admin] Upserted super admin (role_id=1, status=true).");
  console.log(`[seed:admin] Email: ${email}`);
  if (
    password === DEFAULT_PASSWORD &&
    (process.env.SEED_ADMIN_PASSWORD === undefined ||
      process.env.SEED_ADMIN_PASSWORD.trim() === "")
  ) {
    console.warn(
      "[seed:admin] Using default password. Set SEED_ADMIN_PASSWORD in .env and run again.",
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("[seed:admin] Failed:", err);
  mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
