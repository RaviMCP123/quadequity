import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import ContactSubmissionSchema from "./contact.schema";
import { ContactController } from "./contact.controller";
import { ContactService } from "./contact.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: "ContactSubmission", schema: ContactSubmissionSchema },
    ]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
