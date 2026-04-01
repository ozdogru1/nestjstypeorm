import { Inject, HttpException, HttpStatus, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import axios from 'axios';

type ForwardHeaders = Record<string, string>;

@Injectable({ scope: Scope.REQUEST })
export class HttpClientService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) {}

  private headerValue(name: 'authorization' | 'cookie'): string | undefined {
    const v = this.request.headers[name];
    if (!v) return undefined;
    if (Array.isArray(v)) return v[0];
    return v;
  }

  private buildForwardHeaders(overrides?: { authorization?: string; cookie?: string }): ForwardHeaders {
    const headers: ForwardHeaders = {
      Accept: 'application/json',
    };

    const authorization = overrides?.authorization ?? this.headerValue('authorization');
    if (authorization) headers.Authorization = authorization;

    const cookie = overrides?.cookie ?? this.headerValue('cookie');
    if (cookie) headers.Cookie = cookie;

    return headers;
  }

  async getEcommerce<T = unknown>(
    path: string,
    overrides?: { authorization?: string; cookie?: string },
  ): Promise<T> {
    const baseUrl = this.configService.get<string>('ECOMMERCE_API_BASE_URL');
    if (!baseUrl) {
      throw new HttpException('Missing ECOMMERCE_API_BASE_URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    return this.httpGetJsonOrText<T>(url, this.buildForwardHeaders(overrides));
  }

  private async httpGetJsonOrText<T>(urlStr: string, headers: ForwardHeaders): Promise<T> {
    const requestObj = {
      method: 'GET',
      headers,
      timeout: 10000,
      // Non-2xx durumlarda da sonucu yakalayalım.
      validateStatus: () => true,
    }
    const res = await axios.get(urlStr, requestObj);
    const status = res.status ?? 0;
    if (status >= 200 && status < 300) {
      return res.data as T;
    }

    throw new HttpException(
      {
        message: 'Ecommerce API responded with an error',
        url: urlStr,
        status,
        data: res.data,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

