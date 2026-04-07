import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import type { Request } from 'express';
import { HttpClientService } from './http-client.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable({ scope: Scope.REQUEST })
export class EcommerceProfileGuard implements CanActivate {
  constructor(
    private readonly httpClient: HttpClientService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly reflector: Reflector,
  ) { }

  private headerValue(value: string | string[] | undefined): string | undefined {
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();

    const authorization = this.headerValue(req.headers['authorization']);
    const cookie = this.headerValue(req.headers['cookie']);

    const token =
      authorization?.startsWith('Bearer ')
        ? authorization.slice('Bearer '.length).trim()
        : undefined;

    if (!token) {
      throw new HttpException(
        'Ecommerce profile check failed',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const normalizedAuthorization = `Bearer ${token}`;
    const cacheKey = `ecommerce_profile_${token}`;
    const cached = await this.cacheManager.get(cacheKey);
    console.log("cacheKey kontrol:", JSON.stringify(cacheKey, null, 2));
    console.log("cache kontrol:", JSON.stringify(cached, null, 2));
    if (cached) {
      console.log("cache'den döndü, servis çağrılmadı");
      return true;
    }

    const profile = await this.httpClient.getEcommerce('getLoggedinProfile', {
      authorization: normalizedAuthorization,
      cookie,
    });
    //console.log("profile", JSON.stringify(profile?.user?.ecommerceMail, null, 2));

    if (
      profile &&
      typeof profile === 'object' &&
      'success' in profile &&
      (profile as { success?: boolean }).success !== true
    ) {
      throw new HttpException(
        'Ecommerce profile check failed',
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.cacheManager.set(cacheKey, true, 600000);
    console.log("cache'e yazıldı", cacheKey);

    return true;
  }
}
