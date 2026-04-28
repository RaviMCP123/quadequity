import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import AppSettingSchema from "./settings.schema";
import { SettingsService } from "./settings.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "AppSetting", schema: AppSettingSchema }]),
  ],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
