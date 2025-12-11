import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignatureService } from './signature.service';
import { SignPdfDto } from '../dto/sign-pdf.dto';
import { VerifyPdfDto } from '../dto/verify-pdf.dto';
import { HttpResponse } from 'src/utils/HttpResponse';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post('sign/file')
  @UseInterceptors(FileInterceptor('file'))
  signFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return HttpResponse({
        status: 400,
        type: 'warning',
        data: 'PDF_REQUERIDO',
      });
    }

    const result = this.signatureService.signPDF(file.buffer);

    return HttpResponse({
      status: 200,
      type: 'success',
      data: result,
    });
  }

  @Post('sign/base64')
  signBase64(@Body() body: SignPdfDto) {
    console.log('Body recibido:', body);
    if (!body || !body.pdfBase64) {
      return HttpResponse({
        status: 400,
        type: 'warning',
        data: 'PDF_BASE64_REQUERIDO',
      });
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = Buffer.from(body.pdfBase64, 'base64');
    } catch {
      return HttpResponse({
        status: 400,
        type: 'danger',
        data: 'PDF_BASE64_INVALIDO',
      });
    }

    const result = this.signatureService.signPDF(pdfBuffer);

    return HttpResponse({
      status: 200,
      type: 'success',
      data: result,
    });
  }

  @Post('verify')
  @UseInterceptors(FileInterceptor('file'))
  verify(@UploadedFile() file: Express.Multer.File, @Body() body: VerifyPdfDto) {
    const { hash, signature, pdfBase64 } = body;

    if (!hash || hash.length !== 64) {
      return HttpResponse({
        status: 400,
        data: 'HASH_INVALIDO',
      });
    }

    if (!signature) {
      return HttpResponse({
        status: 400,
        data: 'SIGNATURE_REQUERIDA',
      });
    }

    let pdfBuffer: Buffer;
    if (file) {
      pdfBuffer = file.buffer;
    } else if (pdfBase64) {
      try {
        pdfBuffer = Buffer.from(pdfBase64, 'base64');
      } catch {
        return HttpResponse({
          status: 400,
          data: 'PDF_BASE64_INVALIDO',
        });
      }
    } else {
      return HttpResponse({
        status: 400,
        data: 'PDF_REQUERIDO',
      });
    }

    const valid = this.signatureService.verifyPDF(pdfBuffer, signature, hash);

    return HttpResponse({
      status: 200,
      type: valid ? 'success' : 'danger',
      data: { valid },
    });
  }
}
