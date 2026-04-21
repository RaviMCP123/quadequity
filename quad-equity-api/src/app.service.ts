import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  /**
   * Returns a basic status message.
   */
  getHello(): string {
    return "Hello World!";
  }
}
