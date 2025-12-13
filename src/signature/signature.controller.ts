import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignatureService } from './signature.service';
import { SignFileDto } from '../dto/sign-file.dto';
import { VerifyFileDto } from '../dto/verify-file.dto';
import { HttpResponse } from 'src/utils/HttpResponse';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

@Post('sign/file')
@UseInterceptors(FileInterceptor('file'))
async signFile(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    return HttpResponse({
      status: 400,
      type: 'warning',
      data: 'ARCHIVO_REQUERIDO',
    });
  }
  const result = await this.signatureService.signFile(file.buffer);
  return HttpResponse({
    status: result.alreadySigned ? 200 : 201,
    type: result.alreadySigned ? 'warning' : 'success',
    data: result.message,
  });
}


  @Post('sign/base64')
async signBase64(@Body() body: SignFileDto) {
  if (!body || !body.fileBuffer64) {
    return HttpResponse({
      status: 400,
      type: 'warning',
      data: 'ARCHIVO_BASE64_REQUERIDO',
    });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = Buffer.from(body.fileBuffer64, 'base64');
  } catch {
    return HttpResponse({
      status: 400,
      type: 'danger',
      data: 'ARCHIVO_BASE64_INVALIDO',
    });
  }

  const result = await this.signatureService.signFile(fileBuffer);
  return HttpResponse({
    status: result.alreadySigned ? 200 : 201,
    type: result.alreadySigned ? 'warning' : 'success',
    data: result.message,
  });
}

@Post('verify/base64')
async verifyBase64(@Body() body: VerifyFileDto) {
  if (!body || !body.fileBuffer64) {
    return HttpResponse({
      status: 400,
      type: 'warning',
      data: 'ARCHIVO_BASE64_REQUERIDO',
    });
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = Buffer.from(body.fileBuffer64, 'base64');
  } catch {
    return HttpResponse({
      status: 400,
      type: 'danger',
      data: 'ARCHIVO_BASE64_INVALIDO',
    });
  }

  const valid = await this.signatureService.verifyFile(fileBuffer);

  return HttpResponse({
    status: 200,
    type: valid ? 'success' : 'danger',
    data: { valid },
  });
}


  @Post('verify')
  @UseInterceptors(FileInterceptor('file'))
  async verify(@UploadedFile() file: Express.Multer.File) {
    let fileBuffer: Buffer;
    if (file) {
      fileBuffer = file.buffer;
    } else {
      return HttpResponse({
        status: 400,
        data: 'ARCHIVO_REQUERIDO',
      });
    }

    const valid = await this.signatureService.verifyFile(fileBuffer);

    return HttpResponse({
      status: 200,
      type: valid ? 'success' : 'danger',
      data: { valid },
    });
  }
}
