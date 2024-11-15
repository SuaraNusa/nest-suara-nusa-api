import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { InstrumentService } from './instrument.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('instrument')
export class InstrumentController {
  constructor(private readonly instrumentService: InstrumentService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images' }, // Menangkap maksimal 5 file pada field "images"
      { name: 'audios' }, // Menangkap maksimal 3 file pada field "audios"
    ]),
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
        data: await this.instrumentService.create(createInstrumentDto),
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

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstrumentDto: UpdateInstrumentDto,
  ) {
    return this.instrumentService.update(+id, updateInstrumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instrumentService.remove(+id);
  }
}
