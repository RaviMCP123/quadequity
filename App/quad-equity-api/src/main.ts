import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { I18nValidationExceptionFilter } from "nestjs-i18n";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/all-exceptions.filter";
import { MongoExceptionFilter } from "./common/filters/mongo-exception.filter";
import { AuthModule } from "./auth/auth.module";
import { CmsModule } from "./cms/cms.module";
import { PageModule } from "./page/page.module";
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const publicDir = resolve(process.cwd(), "public");
  const pageContentDir = join(publicDir, "page-content");

  if (!existsSync(pageContentDir)) {
    mkdirSync(pageContentDir, { recursive: true });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();
  app.useStaticAssets(publicDir);
  app.setGlobalPrefix("api");
  app.setViewEngine("ejs");

  app.use((req, res, next) => {
    if (req.path === "/") {
      return res.sendFile(join(__dirname, "..", "view", "index.html"));
    }
    next();
  });

  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalFilters(new I18nValidationExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Quad Equity CMS API")
    .setDescription("Auth, CMS categories, and static pages (admin parity).")
    .setVersion("1.0")
    .addBearerAuth()
    .addApiKey(
      { type: "apiKey", name: "X-USER-TOKEN", in: "header" },
      "X-USER-TOKEN",
    )
    .addApiKey(
      { type: "apiKey", name: "x-access-token", in: "header" },
      "x-access-token",
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    include: [AuthModule, CmsModule, PageModule],
    deepScanRoutes: true,
  });
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Quad Equity API listening on port ${port} (global prefix /api)`);
}
bootstrap();
