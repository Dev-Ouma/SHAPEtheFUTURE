import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Prefer human-readable HTML for browser / document asset 404s.
 * API clients (Accept: application/json) still receive JSON.
 * Logs 5xx (and non-noise 4xx) for observability.
 */
@Catch()
export class BrowserFriendlyExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BrowserFriendlyExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)?.message ||
          (exception instanceof Error ? exception.message : 'Unexpected error');
    const messageText = Array.isArray(message)
      ? message.join(', ')
      : String(message);

    // Never leak internal Error.message for unexpected 500s
    const clientMessage =
      status >= 500 && !(exception instanceof HttpException)
        ? 'An unexpected error occurred. Please try again later.'
        : messageText;

    this.logException(status, request, messageText, exception);

    if (status === HttpStatus.NOT_FOUND && this.shouldRenderHtml(request)) {
      const path = this.safePath(request.url);
      response
        .status(HttpStatus.NOT_FOUND)
        .type('html')
        .send(this.html404(path));
      return;
    }

    response.status(status).json({
      statusCode: status,
      message: clientMessage,
      error:
        exception instanceof HttpException
          ? (exceptionResponse as any)?.error || HttpStatus[status] || 'Error'
          : 'Internal Server Error',
      path: request.url?.split('?')[0],
      timestamp: new Date().toISOString(),
    });
  }

  private logException(
    status: number,
    request: Request,
    message: string,
    exception: unknown,
  ) {
    const method = request.method;
    const path = request.url?.split('?')[0] || '';
    const line = `${method} ${path} → ${status}: ${message}`;

    if (status >= 500) {
      const stack =
        exception instanceof Error
          ? exception.stack
          : exception instanceof HttpException
            ? String(exception)
            : undefined;
      this.logger.error(line, stack);
      return;
    }

    // Skip noisy auth challenges; keep validation / not-found visibility
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      this.logger.debug(line);
      return;
    }

    this.logger.warn(line);
  }

  private shouldRenderHtml(request: Request): boolean {
    const accept = String(request.headers.accept || '');
    const path = String(request.path || request.url || '').split('?')[0];
    const looksLikeDocument =
      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|csv|png|jpe?g|webp|gif)$/i.test(
        path,
      );
    const prefersHtml =
      accept.includes('text/html') ||
      (!accept.includes('application/json') &&
        !!request.headers['sec-fetch-mode']);
    return looksLikeDocument || prefersHtml;
  }

  private safePath(url?: string): string {
    const raw = String(url || '/').split('?')[0];
    return raw.replace(/[<>&"']/g, '');
  }

  private html404(path: string): string {
    const frontendBase = (
      process.env.FRONTEND_URL ||
      process.env.PUBLIC_SITE_URL ||
      'http://127.0.0.1:3000'
    ).replace(/\/$/, '');
    const downloadsHref = `${frontendBase}/downloads`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Document not found | Open University of Kenya</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: linear-gradient(160deg, #f4fbfc 0%, #eef6f7 45%, #ffffff 100%);
      color: #001f26;
    }
    .card {
      width: min(92vw, 34rem);
      background: #fff;
      border: 1px solid rgba(15, 110, 126, 0.12);
      box-shadow: 0 24px 48px rgba(0, 31, 38, 0.08);
      padding: 2.5rem 2rem;
      text-align: center;
    }
    .eyebrow {
      font-size: 0.65rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-weight: 800;
      color: #0f6e7e;
      margin-bottom: 1rem;
    }
    h1 {
      margin: 0 0 0.75rem;
      font-size: 1.65rem;
      line-height: 1.2;
      letter-spacing: -0.03em;
    }
    p {
      margin: 0 0 1.5rem;
      color: #475569;
      line-height: 1.6;
      font-size: 0.95rem;
    }
    code {
      display: inline-block;
      max-width: 100%;
      overflow-wrap: anywhere;
      background: #f1f5f9;
      color: #334155;
      padding: 0.35rem 0.55rem;
      font-size: 0.75rem;
      margin-bottom: 1.5rem;
    }
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 2.75rem;
      padding: 0 1.25rem;
      background: #0f6e7e;
      color: #fff;
      text-decoration: none;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    a:hover { background: #0b5662; }
  </style>
</head>
<body>
  <main class="card">
    <div class="eyebrow">Open University of Kenya</div>
    <h1>Document unavailable</h1>
    <p>The file you requested could not be found. It may have been moved, renamed, or is not yet published in the institutional repository.</p>
    <code>${path}</code>
    <div>
      <a href="${downloadsHref}">Return to Downloads</a>
    </div>
  </main>
</body>
</html>`;
  }
}
