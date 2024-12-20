import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import PrismaService from '../../common/prisma.service';
import { NO_VERIFIED_EMAIL } from '../decorator/no-verified-email.decorator';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class NoVerifiedEmailGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass],
    );
    if (isPublic) {
      return true;
    }
    // Mengecek apakah decorator NO_VERIFIED_EMAIL ada dan di-set ke true
    const noVerifiedEmail: boolean = this.reflector.getAllAndOverride<boolean>(
      NO_VERIFIED_EMAIL,
      [context.getHandler(), context.getClass()],
    );

    // Jika decorator `noVerifiedEmail` ada dan di-set ke true, izinkan masuk
    if (noVerifiedEmail) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userUniqueId = request.userUniqueId as string;

    try {
      // Cari user berdasarkan uniqueId
      const user = await this.prismaService.user.findFirstOrThrow({
        where: { uniqueId: userUniqueId },
      });

      // Jika email belum diverifikasi, lemparkan UnauthorizedException
      if (!user.emailVerifiedAt) {
        throw new UnauthorizedException(`User not verified`);
      }

      // Email pengguna sudah terverifikasi
      return true;
    } catch (error) {
      // Jika pengguna tidak ditemukan atau ada kesalahan lain, lemparkan UnauthorizedException
      throw new UnauthorizedException(error.message || `User not found`);
    }
  }
}
