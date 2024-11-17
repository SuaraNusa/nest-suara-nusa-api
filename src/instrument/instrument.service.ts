import { Injectable } from '@nestjs/common';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { InstrumentValidation } from './instrument.validation';
import { Instrument } from '@prisma/client';
import CommonHelper from '../helper/CommonHelper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InstrumentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createInstrumentDto: CreateInstrumentDto,
    allFiles: {
      images?: Express.Multer.File[];
      audios?: Express.Multer.File[];
    },
  ) {
    const validatedCreateInstrument = this.validationService.validate(
      InstrumentValidation.SAVE,
      createInstrumentDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const { videoUrls, ...remainderProperty } = validatedCreateInstrument;
      const instrumentPrisma: Instrument =
        await prismaTransaction.instrument.create({
          data: remainderProperty,
        });
      const instrumentResourcesPayload = [];
      for (const videoUrl of videoUrls) {
        instrumentResourcesPayload.push({
          instrumentId: instrumentPrisma.id,
          videoUrl,
        });
      }
      for (const imageFile of allFiles['images']) {
        const generatedFileName = CommonHelper.handleSaveFileLocally(
          this.configService,
          imageFile,
          'instrument-resources',
        );
        instrumentResourcesPayload.push({
          instrumentId: instrumentPrisma.id,
          imagePath: generatedFileName,
        });
      }
      for (const audioFile of allFiles['audios']) {
        const generatedFileName = CommonHelper.handleSaveFileLocally(
          this.configService,
          audioFile,
          'instrument-resources',
        );
        instrumentResourcesPayload.push({
          instrumentId: instrumentPrisma.id,
          audioPath: generatedFileName,
        });
      }
      await prismaTransaction.instrumentResources.createMany({
        data: instrumentResourcesPayload,
      });
      return true;
    });
  }

  findAll() {
    return `This action returns all instrument`;
  }

  findOne(id: number) {
    return `This action returns a #${id} instrument`;
  }

  update(id: number, updateInstrumentDto: UpdateInstrumentDto) {
    return `This action updates a #${id} instrument`;
  }

  remove(id: number) {
    return `This action removes a #${id} instrument`;
  }
}
