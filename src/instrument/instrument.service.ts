import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { InstrumentValidation } from './instrument.validation';
import { Instrument } from '@prisma/client';
import CommonHelper from '../helper/CommonHelper';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';

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
    const validatedCreateInstrumentDto = this.validationService.validate(
      InstrumentValidation.SAVE,
      createInstrumentDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const { videoUrls, ...remainderProperty } = validatedCreateInstrumentDto;
      const instrumentPrisma: Instrument =
        await prismaTransaction.instrument.create({
          data: remainderProperty,
        });

      await prismaTransaction.instrumentResources.createMany({
        data: await this.generateResourcePayload(
          videoUrls,
          instrumentPrisma,
          allFiles,
        ),
      });
      return true;
    });
  }

  async findAll() {
    return this.prismaService.instrument.findMany({
      include: {
        InstrumentResources: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prismaService.instrument.findMany({
      where: {
        id,
      },
      include: {
        InstrumentResources: true,
      },
    });
  }

  async update(
    id: number,
    updateInstrumentDto: UpdateInstrumentDto,
    allFiles: {
      images?: Express.Multer.File[];
      audios?: Express.Multer.File[];
    },
  ) {
    const validatedUpdateInstrumentDto = this.validationService.validate(
      InstrumentValidation.UPDATE,
      updateInstrumentDto,
    );
    await this.prismaService.$transaction(async (prismaTransaction) => {
      const instrumentPrisma = await prismaTransaction.instrument
        .findFirstOrThrow({
          where: {
            id,
          },
        })
        .catch(() => {
          throw new NotFoundException('Instrument not found');
        });

      await prismaTransaction.instrumentResources.deleteMany({
        where: {
          id: {
            in: validatedUpdateInstrumentDto.deletedFiles,
          },
        },
      });
      for (const deletedFile of validatedUpdateInstrumentDto.deletedFiles) {
        fs.unlinkSync(
          `${this.configService.get<string>('MULTER_DEST')}/instrument-resources/${deletedFile}`,
        );
      }
      const { videoUrls, ...remainderProperty } = validatedUpdateInstrumentDto;
      await prismaTransaction.instrumentResources.createMany({
        data: await this.generateResourcePayload(
          videoUrls,
          instrumentPrisma,
          allFiles,
        ),
      });
      await prismaTransaction.instrument.update({
        where: {
          id: id,
        },
        data: {
          ...remainderProperty,
          instrumentCategory: validatedUpdateInstrumentDto.instrumentCategory,
        },
      });
      return true;
    });
  }

  remove(id: number) {
    return `This action removes a #${id} instrument`;
  }

  async generateResourcePayload(
    videoUrls: string[],
    instrumentPrisma: Instrument,
    allFiles: {
      images?: Express.Multer.File[];
      audios?: Express.Multer.File[];
    },
  ) {
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
    return instrumentResourcesPayload;
  }
}
