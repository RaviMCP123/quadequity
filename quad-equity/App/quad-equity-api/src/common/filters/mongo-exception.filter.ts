import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { MongoServerError } from "mongodb";

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Define a response structure for MongoDB errors
    const status = HttpStatus.UNPROCESSABLE_ENTITY; // You can customize this based on the error type
    let message = exception.message || "Database error occurred";
    if (exception.code === 11000) {
      const field = Object.keys(exception.keyValue)[0];
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please choose a different ${field}.`;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
      data: {},
      message: message,
    });
  }
}
