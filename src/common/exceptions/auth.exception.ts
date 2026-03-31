import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCodes } from '../constants/error-codes';

export class UnauthorizedException extends BaseException {
    constructor(message = 'Yetkisiz erişim') {
        super(ErrorCodes.UNAUTHORIZED, message, HttpStatus.UNAUTHORIZED);
    }
}

export class ForbiddenException extends BaseException {
    constructor(message = 'Bu işlem için yetkiniz yok') {
        super(ErrorCodes.FORBIDDEN, message, HttpStatus.FORBIDDEN);
    }
}

export class EmailAlreadyExistsException extends BaseException {
    constructor() {
        super(ErrorCodes.EMAIL_ALREADY_EXISTS, 'Bu email adresi zaten kullanımda', HttpStatus.CONFLICT);
    }
}

export class InvalidCredentialsException extends BaseException {
    constructor() {
        super(ErrorCodes.INVALID_CREDENTIALS, 'Email veya şifre hatalı', HttpStatus.UNAUTHORIZED);
    }
}