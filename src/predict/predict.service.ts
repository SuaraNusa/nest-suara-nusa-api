import { Injectable } from '@nestjs/common';
import { UpdatePredictDto } from './dto/update-predict.dto';
import { ConfigService } from '@nestjs/config';
import ValidationService from '../common/validation.service';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data'; // Import library FormData
import { Readable } from 'stream';
import { CreatePredictDto } from './dto/create-predict.dto';
import { firstValueFrom } from 'rxjs'; // Untuk membaca buffer file

@Injectable()
export class PredictService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    createPredictDto: CreatePredictDto,
    voiceFile: Express.Multer.File, // File yang diupload
  ): Promise<any> {
    const inferApiEndpoint =
      this.configService.get<string>('INFER_API_ENDPOINT');

    // Membuat FormData untuk multipart request
    const formData = new FormData();
    formData.append('voice', Readable.from(voiceFile.buffer), {
      filename: voiceFile.originalname,
      contentType: voiceFile.mimetype,
    });

    // Menambahkan data tambahan jika diperlukan
    Object.keys(createPredictDto).forEach((key) => {
      formData.append(key, createPredictDto[key]);
    });

    // Membuat request dengan header yang sesuai
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${inferApiEndpoint}/predict`, formData, {
          headers: formData.getHeaders(),
        }),
      );

      console.log(response.data);
      return response.data; // Mengembalikan data respons dari Infer API
    } catch (error) {
      console.error('Error posting to Infer API:', error.message);
      throw error;
    }
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
