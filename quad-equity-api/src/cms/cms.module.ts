import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CmsCategoryController } from "./cms-category.controller";
import { CmsCategoryService } from "./cms-category.service";
import CmsCategorySchema from "./cms-category.schema";
import { UsersModule } from "../users/users.module";
import { AuditLogModule } from "../audit-log/audit-log.module";
import { PageModule } from "../page/page.module";
import PageSchema from "../page/page.schema";

@Module({
  imports: [
    UsersModule,
    AuditLogModule,
    PageModule, // Import PageModule to access Page model
    MongooseModule.forFeature([
      { name: "CmsCategory", schema: CmsCategorySchema },
      { name: "Page", schema: PageSchema }, // Also register Page model here for service injection
    ]),
  ],
  controllers: [CmsCategoryController],
  providers: [CmsCategoryService],
  exports: [CmsCategoryService, MongooseModule],
})
export class CmsModule {}
