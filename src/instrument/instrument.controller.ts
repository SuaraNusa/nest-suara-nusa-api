import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { InstrumentService } from './instrument.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('instruments')
export class InstrumentController {
  constructor(private readonly instrumentService: InstrumentService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }, { name: 'audios' }]),
  )
  async create(
    @Body() createInstrumentDto: CreateInstrumentDto,
    @UploadedFiles()
    allFiles: {
      images?: Express.Multer.File[];
      audios?: Express.Multer.File[];
    },
  ) {
    return {
      result: {
        data: await this.instrumentService.create(
          createInstrumentDto,
          allFiles,
        ),
      },
    };
  }

  @Get()
  async findAll() {
    return this.instrumentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instrumentService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }, { name: 'audios' }]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInstrumentDto: UpdateInstrumentDto,
    @UploadedFiles()
    allFiles: {
      images?: Express.Multer.File[];
      audios?: Express.Multer.File[];
    },
  ) {
    return {
      result: {
        data: await this.instrumentService.update(
          id,
          updateInstrumentDto,
          allFiles,
        ),
      },
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return {
      result: {
        data: await this.instrumentService.remove(+id),
      },
    };
  }
}
