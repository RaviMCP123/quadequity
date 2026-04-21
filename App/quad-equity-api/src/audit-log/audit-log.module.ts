import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogController } from "./audit-log.controller";
import { AuditLogService } from "./audit-log.service";
import { UsersService } from "../users/users.service";
import AuditLogSchema from "./audit-log.schema";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([{ name: "AuditLog", schema: AuditLogSchema }]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService, UsersService],
  exports: [AuditLogService, MongooseModule],
})
export class AuditLogModule {}
