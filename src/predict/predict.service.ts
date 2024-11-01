import { Injectable } from '@nestjs/common';
import { CreatePredictDto } from './dto/create-predict.dto';
import { UpdatePredictDto } from './dto/update-predict.dto';
import { ConfigService } from '@nestjs/config';
import { ModelRegistryService } from '../common/model-registry.service';
import ValidationService from '../common/validation.service';
import * as tf from '@tensorflow/tfjs-node';
import { AudioContext } from 'node-web-audio-api';
import { tensor } from '@tensorflow/tfjs-node';

@Injectable()
export class PredictService {
  constructor(
    private readonly configService: ConfigService,
    private readonly modelRegistryService: ModelRegistryService,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    createPredictDto: CreatePredictDto,
    voiceFile: Express.Multer.File,
  ): Promise<void> {
    console.log(voiceFile);

    const modelInstance = await this.modelRegistryService.getModelInstance();
    const audioContext = new AudioContext();

    // Mendapatkan buffer dari file suara
    const voiceFileBuffer = voiceFile.buffer;
    const arrayBuffer = voiceFileBuffer.buffer.slice(
      voiceFileBuffer.byteOffset,
      voiceFileBuffer.byteOffset + voiceFileBuffer.byteLength,
    );

    // Decode audio data menggunakan audioContext
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Ambil data channel pertama
    const audioSignal = audioBuffer.getChannelData(0);

    // Hitung panjang yang kelipatan dari 40
    const lengthToTrim = Math.floor(audioSignal.length / 40) * 40; // Menghitung panjang kelipatan dari 40
    const trimmedInput = audioSignal.slice(0, lengthToTrim); // Memotong data menjadi kelipatan dari 40

    // Buat tensor dari input yang telah dipotong dan reshape menjadi bentuk yang sesuai
    const inputTensor = tf.tensor(trimmedInput).reshape([-1, 40, 1]); // Tambahkan dimensi batch

    // Inferensi dengan model
    const predictions = modelInstance.execute({
      input_4: inputTensor,
    }) as tf.Tensor;

    // Ambil kelas prediksi
    const predictedClass = (await predictions.argMax(-1).data())[0];
    console.log(predictedClass);
  }

  findAll() {
    return `This action returns all predict`;
  }

  findOne(id: number) {
    return `This action returns a #${id} predict`;
  }

  update(id: number, updatePredictDto: UpdatePredictDto) {
    return `This action updates a #${id} predict`;
  }

  remove(id: number) {
    return `This action removes a #${id} predict`;
  }
}
