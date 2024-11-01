import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PredictService } from './predict.service';
import { CreatePredictDto } from './dto/create-predict.dto';
import { UpdatePredictDto } from './dto/update-predict.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { NoVerifiedEmail } from '../authentication/decorator/no-verified-email.decorator';
import { Public } from 'src/authentication/decorator/public.decorator';

@Controller('predict')
export class PredictController {
  constructor(private readonly predictService: PredictService) {}

  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('voice'))
  create(
    @Body() createPredictDto: CreatePredictDto,
    @UploadedFile() voiceFile: Express.Multer.File,
  ): Promise<void> {
    return this.predictService.create(createPredictDto, voiceFile);
  }

  @Get()
  findAll() {
    return this.predictService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.predictService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePredictDto: UpdatePredictDto) {
    return this.predictService.update(+id, updatePredictDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.predictService.remove(+id);
  }
}
