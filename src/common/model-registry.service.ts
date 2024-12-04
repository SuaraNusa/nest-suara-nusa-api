import '@tensorflow/tfjs-node';
import { loadGraphModel, loadLayersModel } from "@tensorflow/tfjs-node";
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class ModelRegistryService {
  constructor(private readonly configService: ConfigService) {}

  private modelInstance: any;

  async getModelInstance() {
    if (!this.modelInstance) {
      await this.loadModel();
    }

    return this.modelInstance;
  }

  async downloadFolder(localPath: string) {
    const bucketStorage = new Storage();
    const [files] = await bucketStorage
      .bucket('submissionmlgc-alfarezyyd-bucket-production')
      .getFiles({ prefix: 'submissions-model' });

    for (const file of files) {
      const filePath = path.join(
        localPath,
        file.name.replace('submissions-model' + '/', ''),
      );
      const dir = path.dirname(filePath);

      // Buat folder jika tidak ada
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory: ${error.message}`);
      }

      // Unduh file
      try {
        await file.download({ destination: filePath });
        if (fs.existsSync(filePath)) {
        } else {
        }
      } catch (err) {
        console.error('Error downloading file:', err);
      }
    }
  }

  async loadModel() {
    const localModelPath = 'src/core';
    //
    // // Download model.json dan semua file terkait (berkas model lainnya)
    // await this.downloadFolder(localModelPath);

    // Muat model menggunakan TensorFlow.js
    this.modelInstance = await loadLayersModel(
      `file://${localModelPath}/model.json`,
    );
  }
}
