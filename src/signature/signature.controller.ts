import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignatureService } from './signature.service';

@Controller('signature')
export class SignatureController {
  constructor(private readonly signatureService: SignatureService) {}

  @Post('sign')
  @UseInterceptors(FileInterceptor('file'))
  sign(@UploadedFile() file: Express.Multer.File) {
    const result = this.signatureService.signPDF(file.buffer);
    return result;
  }

  @Post('verify')
  @UseInterceptors(FileInterceptor('file'))
  verify(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { signature: string; hash: string },
  ) {
    const { signature, hash } = body;

    const isValid = this.signatureService.verifyPDF(
      file.buffer,
      signature,
      hash,
    );

    return { valid: isValid };
  }
}
