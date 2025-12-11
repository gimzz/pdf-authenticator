import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SignatureService {
  private privateKey: string;
  private publicKey: string;

  constructor() {
    const keysPath = path.join(process.cwd(), 'keys');

    this.privateKey = fs.readFileSync(keysPath + '/private.key', 'utf8');
    this.publicKey = fs.readFileSync(keysPath + '/public.key', 'utf8');
  }

  generateHash(pdfBuffer: Buffer): string {
    return crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  }

  signPDF(pdfBuffer: Buffer): { hash: string; signature: string } {
    const hash = this.generateHash(pdfBuffer);

    const signature = crypto.sign(
      'sha256',
      Buffer.from(hash),
      this.privateKey,
    );

    return {
      hash,
      signature: signature.toString('base64'),
    };
  }

  verifyPDF(
    pdfBuffer: Buffer,
    signature: string,
    hash: string,
  ): boolean {
    const currentHash = this.generateHash(pdfBuffer);

    if (currentHash !== hash) return false;

    return crypto.verify(
      'sha256',
      Buffer.from(hash),
      this.publicKey,
      Buffer.from(signature, 'base64'),
    );
  }
}
