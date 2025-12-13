import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SignatureService {
  private privateKey: string;
  private publicKey: string;
  private SECRET_KEY: string;
  private AES_KEY: Buffer;
  private IV_UNSAFE: Buffer;

  constructor(private readonly prisma: PrismaService) {
    this.SECRET_KEY = process.env.SECRET_KEY as string;
    if (!this.SECRET_KEY) {
      throw new Error('SECRET_KEY no está definida en el archivo .env');
    }
    this.AES_KEY = Buffer.alloc(32, this.SECRET_KEY, 'utf8');
    this.IV_UNSAFE = Buffer.alloc(16, this.SECRET_KEY, 'utf8');
    const keysPath = path.join(process.cwd(), 'keys');
    this.privateKey = fs.readFileSync(
      path.join(keysPath, 'private.key'),
      'utf8',
    );
    this.publicKey = fs.readFileSync(path.join(keysPath, 'public.key'), 'utf8');
  }

  generateHash(fileBuffer: Buffer): string {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  private encryptAES(text: string, unsafe = false): string {
    const iv = unsafe ? this.IV_UNSAFE : crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', this.AES_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('base64');
  }

  private decryptAES(base64: string, unsafe = false): string {
    const raw = Buffer.from(base64, 'base64');
    const iv = unsafe ? this.IV_UNSAFE : raw.subarray(0, 16);
    const encrypted = unsafe ? raw : raw.subarray(16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.AES_KEY, iv);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString();
  }

async signFile(fileBuffer: Buffer, unsafeAES = false) {
  const hash = this.generateHash(fileBuffer);

  const exists = await this.prisma.singFile.findUnique({
    where: { hash },
  });

  if (exists) {
    return {
      message: 'El archivo ya fue firmado previamente',
      alreadySigned: true,
    };
  }

  const signature = crypto.sign('sha256', Buffer.from(hash, 'hex'), {
    key: this.privateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  });

  const encryptedSignature = this.encryptAES(
    signature.toString('base64'),
    unsafeAES,
  );

  await this.prisma.singFile.create({
    data: {
      hash,
      signature: encryptedSignature,
    },
  });

  return {
    message: 'El archivo se ha firmado correctamente',
    alreadySigned: false,
  };
}


  async verifyFile(fileBuffer: Buffer, unsafeAES = false) {
    const currentHash = this.generateHash(fileBuffer);
    const encryptedSignature = await this.prisma.singFile.findUnique({
      where: {
        hash: currentHash,
      },
      select: {
        signature: true,
      },
    });
    if (!encryptedSignature) {
      return false;
    }
    const decryptedSignatureBase64 = this.decryptAES(
      encryptedSignature.signature,
      unsafeAES,
    );
    const signature = Buffer.from(decryptedSignatureBase64, 'base64');
    return crypto.verify(
      'sha256',
      Buffer.from(currentHash, 'hex'),
      this.publicKey,
      signature,
    );
  }
}
