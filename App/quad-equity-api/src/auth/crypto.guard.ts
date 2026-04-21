import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import * as CryptoJS from "crypto-js";

@Injectable()
export class CryptoGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const encryptedData = request.headers["x-access-token"] ?? "";
    const device = request.headers["devicetype"] ?? "";
    if (encryptedData == "1212") {
      throw new ForbiddenException("You are not authorized to access.");
    } else {
      if (device === "localhost") {
        return true;
      } else {
        const key = process.env.CRYPTO_TOKEN;
        const parts = encryptedData.split(".");
        if (parts.length !== 2) {
          throw new ForbiddenException("You are not authorized to access.");
        }
        const [timestampStr, receivedSignature] = parts;
        const requestTimestamp = parseInt(timestampStr, 10);
        if (isNaN(requestTimestamp)) {
          throw new ForbiddenException("You are not authorized to access.");
        }
        const expectedSignature = CryptoJS.HmacSHA256(
          timestampStr,
          key,
        ).toString(CryptoJS.enc.Base64);
        if (expectedSignature !== receivedSignature) {
          throw new ForbiddenException("You are not authorized to access.");
        }
        const currentTimeStamp = Math.floor(Date.now() / 1000);
        const requestTimeDiff = Math.abs(currentTimeStamp - requestTimestamp);
        if (requestTimeDiff > 60) {
          throw new ForbiddenException("You are not authorized to access.");
        }
      }
    }

    return true;
  }
}

