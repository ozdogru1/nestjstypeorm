import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { BaseException } from '../common/exceptions/base.exception';
import { ErrorCodes } from '../common/constants/error-codes';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request & { requestId?: string }>();
        const timestamp = new Date().toISOString();
        const path = request.url;

        // Validation hatası (DTO)
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse() as any;

            // NestJS Validation Pipe hatası
            if (Array.isArray(exceptionResponse.message)) {
                const errorResponse = {
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorCode: ErrorCodes.VALIDATION_ERROR,
                    message: 'Girilen veriler geçersiz',
                    errors: exceptionResponse.message.map((msg: string) => ({
                        message: msg,
                    })),
                    timestamp,
                    path,
                };

                this.logger.warn(
                    `${request.method} ${path} ${HttpStatus.BAD_REQUEST} | Validation Error`,
                );

                return response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
            }

            // BaseException (bizim custom exception'larımız)
            if (exception instanceof BaseException) {
                const errorResponse = {
                    success: false,
                    statusCode: status,
                    errorCode: exceptionResponse.errorCode,
                    message: exceptionResponse.message,
                    timestamp,
                    path,
                };

                if (status >= 500) {
                    this.logger.error(
                        `${request.method} ${path} ${status} | ${exceptionResponse.message}`,
                    );
                } else {
                    this.logger.warn(
                        `${request.method} ${path} ${status} | ${exceptionResponse.message}`,
                    );
                }

                return response.status(status).json(errorResponse);
            }

            // Diğer HttpException'lar
            const errorResponse = {
                success: false,
                statusCode: status,
                errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
                message: exception.message,
                timestamp,
                path,
            };

            this.logger.warn(
                `${request.method} ${path} ${status} | ${exception.message}`,
            );

            return response.status(status).json(errorResponse);
        }

        // Prisma hataları
        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            return this.handlePrismaError(exception, request, response, timestamp, path);
        }

        // Beklenmedik hatalar
        this.logger.error(
            `${request.method} ${path} 500 | Unexpected error: ${exception}`,
        );

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: 'Beklenmedik bir hata oluştu',
            timestamp,
            path,
        });
    }

    private handlePrismaError(
        exception: Prisma.PrismaClientKnownRequestError,
        request: Request & { requestId?: string },
        response: Response,
        timestamp: string,
        path: string,
    ) {
        this.logger.error(
            `${request.method} ${path} | Prisma Error: ${exception.code}`,
        );

        switch (exception.code) {
            case 'P2002':
                return response.status(HttpStatus.CONFLICT).json({
                    success: false,
                    statusCode: HttpStatus.CONFLICT,
                    errorCode: ErrorCodes.UNIQUE_CONSTRAINT,
                    message: 'Bu kayıt zaten mevcut',
                    timestamp,
                    path,
                });

            case 'P2025':
                return response.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    statusCode: HttpStatus.NOT_FOUND,
                    errorCode: ErrorCodes.NOT_FOUND,
                    message: 'Kayıt bulunamadı',
                    timestamp,
                    path,
                });

            case 'P2003':
                return response.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    errorCode: ErrorCodes.FOREIGN_KEY_CONSTRAINT,
                    message: 'İlişkili kayıt bulunamadı',
                    timestamp,
                    path,
                });

            default:
                return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    errorCode: ErrorCodes.DATABASE_ERROR,
                    message: 'Veritabanı hatası oluştu',
                    timestamp,
                    path,
                });
        }
    }
}