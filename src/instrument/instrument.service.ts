import { HttpException, Injectable } from '@nestjs/common';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { InstrumentValidation } from './instrument.validation';
import { Instrument } from '@prisma/client';
import CommonHelper from '../helper/CommonHelper';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { CloudStorageService } from '../common/cloud-storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InstrumentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
    private readonly configService: ConfigService,
    private readonly cloudStorageService: CloudStorageService,
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
    return this.prismaService.$transaction(async (prismaTransaction) => {
      const instrumentPrisma = await prismaTransaction.instrument
        .findFirstOrThrow({
          where: {
            id,
          },
        })
        .catch(() => {
          throw new HttpException('Instrument not found', 404);
        });

      if (validatedUpdateInstrumentDto.deletedFiles?.length > 0) {
        const allDeletedFiles =
          await prismaTransaction.instrumentResources.findMany({
            where: {
              id: {
                in: validatedUpdateInstrumentDto.deletedFiles,
              },
            },
          });
        if (
          allDeletedFiles.length !==
          validatedUpdateInstrumentDto.deletedFiles.length
        ) {
          throw new HttpException(`Some resources not found`, 404);
        }
        await prismaTransaction.instrumentResources.deleteMany({
          where: {
            id: {
              in: validatedUpdateInstrumentDto.deletedFiles,
            },
          },
        });
        for (const deletedFile of allDeletedFiles) {
          if (deletedFile.imagePath !== null) {
            fs.unlinkSync(
              `${this.configService.get<string>('MULTER_DEST')}/instrument-resources/${deletedFile.imagePath}`,
            );
          } else if (deletedFile.audioPath !== null) {
            fs.unlinkSync(
              `${this.configService.get<string>('MULTER_DEST')}/instrument-resources/${deletedFile.audioPath}`,
            );
          }
        }
      }
      delete validatedUpdateInstrumentDto['deletedFiles'];
      const { videoUrls, ...remainderProperty } = validatedUpdateInstrumentDto;
      console.log(allFiles);
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

  async remove(id: number) {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.instrument
        .findFirstOrThrow({
          where: {
            id,
          },
        })
        .catch(() => {
          throw new HttpException('Instrument not found', 404);
        });
      const allInstrumentResources =
        await prismaTransaction.instrumentResources.findMany({
          where: {
            instrumentId: id,
          },
        });
      for (const instrumentResource of allInstrumentResources) {
        if (instrumentResource.imagePath !== null) {
          fs.unlinkSync(
            `${this.configService.get<string>('MULTER_DEST')}/instrument-resources/${instrumentResource.imagePath}`,
          );
        } else if (instrumentResource.audioPath !== null) {
          fs.unlinkSync(
            `${this.configService.get<string>('MULTER_DEST')}/instrument-resources/${instrumentResource.audioPath}`,
          );
        }
      }
      await prismaTransaction.instrumentResources.deleteMany({
        where: {
          instrumentId: id,
        },
      });
      await prismaTransaction.instrument.delete({
        where: {
          id,
        },
      });
      return true;
    });
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
    const cloudStorageInstance =
      await this.cloudStorageService.loadCloudStorageInstance();
    for (const imageFile of allFiles['images']) {
      const generatedFileName = `${uuidv4()}-${imageFile.originalname}`;
      await CommonHelper.handleUploadImage(
        cloudStorageInstance,
        this.configService.get<string>('BUCKET_NAME'),
        imageFile,
        generatedFileName,
        'image-resources',
      );
      instrumentResourcesPayload.push({
        instrumentId: instrumentPrisma.id,
        imagePath: generatedFileName,
      });
    }
    for (const audioFile of allFiles['audios']) {
      const generatedFileName = `${uuidv4()}-${audioFile.originalname}`;
      await CommonHelper.handleUploadImage(
        cloudStorageInstance,
        this.configService.get<string>('BUCKET_NAME'),
        audioFile,
        generatedFileName,
        'audio-resources',
      );
      instrumentResourcesPayload.push({
        instrumentId: instrumentPrisma.id,
        audioPath: generatedFileName,
      });
    }
    return instrumentResourcesPayload;
  }
}
