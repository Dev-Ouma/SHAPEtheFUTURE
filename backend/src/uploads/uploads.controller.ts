import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { fromBuffer } from 'file-type';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        // Block executable/installer packages; keep documents and media for CMS.
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|csv|mp4|webm|mov)$/i,
          )
        ) {
          return cb(new BadRequestException('File type not allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.persistVerifiedUpload(file, '/uploads');
  }

  /**
   * Public intake for mobile / website support tickets (no Nest JWT).
   * Accepts screenshots and common document types used in ICT tickets.
   */
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('support')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = './public/uploads/support';
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `support-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          !file.originalname.match(
            /\.(jpg|jpeg|png|webp|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|csv|txt)$/i,
          )
        ) {
          return cb(
            new BadRequestException(
              'File type not allowed for support attachments',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
    }),
  )
  async uploadSupportFile(@UploadedFile() file: Express.Multer.File) {
    return this.persistVerifiedUpload(file, '/uploads/support', [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'text/csv',
      'text/plain',
    ]);
  }

  private async persistVerifiedUpload(
    file: Express.Multer.File,
    urlPrefix: string,
    allowedMimeTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'text/csv',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ],
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const buffer = fs.readFileSync(file.path);
      const type = await fromBuffer(buffer);

      // Some plain-text / CSV files have no magic number — allow by extension fallback.
      const ext = extname(file.originalname).toLowerCase();
      const textLike = ['.txt', '.csv'].includes(ext);
      if ((!type || !allowedMimeTypes.includes(type.mime)) && !textLike) {
        fs.unlinkSync(file.path);
        throw new BadRequestException('Invalid file type detected');
      }
      if (
        textLike &&
        type &&
        ![
          'text/plain',
          'text/csv',
          'application/csv',
          'application/octet-stream',
        ].includes(type.mime) &&
        !allowedMimeTypes.includes(type.mime)
      ) {
        fs.unlinkSync(file.path);
        throw new BadRequestException('Invalid file type detected');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new BadRequestException('Failed to verify file contents');
    }

    return {
      url: `${urlPrefix}/${file.filename}`,
      status: 'processed',
      metadata: {
        name: file.originalname,
        size: file.size,
        sanitized: true,
      },
    };
  }

  @Public()
  @Get('support/:filename')
  serveSupportFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = path.basename(filename);
    const filePath = path.join('./public/uploads/support', safeName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Support attachment not found');
    }
    return res.sendFile(safeName, { root: './public/uploads/support' });
  }

  @Public()
  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = path.basename(filename);
    const filePath = path.join('./public/uploads', safeName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Uploaded file not found');
    }
    return res.sendFile(safeName, { root: './public/uploads' });
  }

  @Post('chat')
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads/chat',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `chat-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
          return cb(
            new BadRequestException(
              'Only images (JPG, PNG, WEBP) are allowed! ❌',
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadChatFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image is required 📸');
    }

    // 1. MIME Type Validation
    const buffer = fs.readFileSync(file.path);
    const type = await fromBuffer(buffer);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!type || !allowedMimeTypes.includes(type.mime)) {
      fs.unlinkSync(file.path);
      throw new BadRequestException(
        'Security Alert: Only valid JPG, PNG, and WEBP images are allowed! ❌',
      );
    }

    // 2. Optional: Process with sharp if available on this platform
    let outputPath = file.path;
    let outputSize = buffer.length;

    try {
      const sharpLib = await import('sharp')
        .then((m) => m.default)
        .catch(() => null);
      if (sharpLib) {
        const processedBuffer = await (sharpLib as any)(buffer)
          .rotate()
          .resize(1200, null, { withoutEnlargement: true })
          .toFormat('webp', { quality: 80 })
          .toBuffer();
        const newPath = file.path.replace(path.extname(file.path), '.webp');
        fs.writeFileSync(newPath, processedBuffer);
        if (newPath !== file.path) fs.unlinkSync(file.path);
        outputPath = newPath;
        outputSize = processedBuffer.length;
      }
    } catch (err) {
      console.warn(
        '[Uploads] sharp unavailable, saving original:',
        err.message,
      );
    }

    // 3. Forward to AI Service
    let analysis = null;
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(outputPath), {
        filename: path.basename(outputPath),
        contentType: type.mime,
      });
      const aiRes = await axios.post(
        'http://localhost:8001/process-image',
        formData,
        {
          headers: { ...formData.getHeaders() },
        },
      );
      analysis = aiRes.data;
    } catch (err) {
      console.warn('[Uploads] AI Processing deferred:', err.message);
    }

    return {
      url: `/uploads/chat/${path.basename(outputPath)}`,
      status: '✅ Securely processed',
      analysis,
      metadata: {
        name: file.originalname,
        size: outputSize,
        type: type.mime,
        sanitized: true,
      },
    };
  }

  @Public()
  @Get('chat/:filename')
  serveChatFile(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = path.basename(filename);
    const filePath = path.join('./public/uploads/chat', safeName);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Chat attachment not found');
    }
    return res.sendFile(safeName, { root: './public/uploads/chat' });
  }
}
