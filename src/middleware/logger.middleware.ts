import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) { }

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip, body, query, params } = req;
        const userAgent = req.get('user-agent') || '';
        const startTime = Date.now();

        const safeBody = { ...body };
        if (safeBody.password) delete safeBody.password;

        res.on('finish', () => {
            const { statusCode } = res;
            const responseTime = Date.now() - startTime;

            const logMessage = `${method} ${originalUrl} ${statusCode} ${responseTime}ms | IP: ${ip} | Body: ${JSON.stringify(safeBody)} | Query: ${JSON.stringify(query)} | Params: ${JSON.stringify(params)} | Agent: ${JSON.stringify(userAgent)}`;

            if (statusCode >= 500) {
                this.logger.error(logMessage);
            } else {
                this.logger.info(logMessage);
            }
        });

        next();
    }
}