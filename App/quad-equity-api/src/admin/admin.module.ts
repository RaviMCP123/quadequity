import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AdminController } from "./admin.controller";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [UsersModule, SettingsModule],
  controllers: [AdminController],
})
export class AdminModule {}
