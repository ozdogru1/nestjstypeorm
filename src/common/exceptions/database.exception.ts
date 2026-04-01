import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCodes } from '../constants/error-codes';

export class UniqueConstraintException extends BaseException {
    constructor(field: string) {
        super(ErrorCodes.UNIQUE_CONSTRAINT, `${field} zaten mevcut`, HttpStatus.CONFLICT);
    }
}

export class ForeignKeyException extends BaseException {
    constructor() {
        super(ErrorCodes.FOREIGN_KEY_CONSTRAINT, 'İlişkili kayıt bulunamadı', HttpStatus.BAD_REQUEST);
    }
}

export class DatabaseException extends BaseException {
    constructor() {
        super(ErrorCodes.DATABASE_ERROR, 'Veritabanı hatası oluştu', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}