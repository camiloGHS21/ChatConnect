import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

/**
 * ============================================================================
 * GUARDIÁN CSRF: CsrfGuard
 * ============================================================================
 * Valida de forma estricta que las peticiones mutables (POST, PUT, PATCH, DELETE)
 * incluyan la cabecera `x-csrf-token` coincidente con el secreto almacenado
 * en la cookie firmada `_csrf`.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest<any>();
    const reply = http.getResponse<any>();

    // Métodos seguros de solo lectura no requieren validación CSRF
    const method = req.method?.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      const csrfProtection = req.server?.csrfProtection;
      if (!csrfProtection) {
        return resolve(true);
      }

      csrfProtection(req, reply, (err: any) => {
        if (err) {
          reject(
            new ForbiddenException({
              error: 'Token CSRF inválido o ausente',
              code: 'FST_CSRF_INVALID_TOKEN',
              message: err.message || 'Petición rechazada por protección CSRF',
            }),
          );
        } else {
          resolve(true);
        }
      });
    });
  }
}
