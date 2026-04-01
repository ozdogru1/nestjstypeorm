import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCodes } from '../constants/error-codes';

export class NotFoundException extends BaseException {
    constructor(message: string) {
        super(ErrorCodes.NOT_FOUND, message, HttpStatus.NOT_FOUND);
    }
}

export class ConflictException extends BaseException {
    constructor(message: string) {
        super(ErrorCodes.CONFLICT, message, HttpStatus.CONFLICT);
    }
}