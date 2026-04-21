import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";

@Controller()
export class AppController {
  /**
   * Serves the API landing page HTML.
   *
   * @param res - Express Response object
   */
  @Get()
  getRoot(@Res() res: Response) {
    res.sendFile(join(__dirname, "..", "view", "index.html"));
  }
}
