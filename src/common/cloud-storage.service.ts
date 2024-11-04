import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class CloudStorageService {
  constructor(private readonly configService: ConfigService) {}

  private STORAGE: Storage;

  async loadCloudStorageInstance(): Promise<Storage> {
    if (this.STORAGE === undefined) {
      this.STORAGE = new Storage();
    }
    return this.STORAGE;
  }
}
