import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PageController } from "./page.controller";
import { PageService } from "./page.service";
import PageSchema from "./page.schema";
import CmsCategorySchema from "../cms/cms-category.schema";
import { UsersModule } from "../users/users.module";
import { AuditLogModule } from "../audit-log/audit-log.module";

@Module({
  imports: [
    UsersModule,
    AuditLogModule,
    MongooseModule.forFeature([
      { name: "Page", schema: PageSchema },
      { name: "CmsCategory", schema: CmsCategorySchema }, // Register CmsCategory model
    ]),
  ],
  controllers: [PageController],
  providers: [PageService],
  exports: [MongooseModule],
})
export class PageModule {}
