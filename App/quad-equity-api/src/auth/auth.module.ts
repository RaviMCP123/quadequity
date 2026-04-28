import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { OtpController } from "./otp.controller";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./jwt.strategy";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    AuditLogModule,
    SettingsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: Number(process.env.JWT_EXPIRES_ID) },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController, OtpController],
})
export class AuthModule {}
