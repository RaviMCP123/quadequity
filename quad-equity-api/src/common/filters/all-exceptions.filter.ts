import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const i18n = request.i18nContext;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status =
        exception.getStatus() === 400
          ? HttpStatus.UNPROCESSABLE_ENTITY
          : exception.getStatus();

      const res = exception.getResponse() as
        | { message?: string | string[] }
        | string;
      message = String(
        exception.getStatus() === 400
          ? Array.isArray((res as { message?: string[] })?.["message"])
            ? ((res as { message?: string[] })?.["message"]?.[0] ??
              "Bad request")
            : "Bad request"
          : typeof res === "object" && res !== null
            ? ((res as { message?: string })?.["message"] ?? "")
            : (res ?? ""),
      );
    } else if (typeof exception === "object" && exception?.message) {
      message = exception.message;
    }

    // ✅ Translate message if possible
    if (i18n) {
      try {
        message = i18n.t(message);
      } catch {
        // Keep original message if translation fails
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      data: {},
      message,
    });
  }
}
