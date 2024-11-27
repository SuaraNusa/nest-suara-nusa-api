import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { WebResponseDto } from '../model/web.response.dto';
import { VerificationQuestion } from '@prisma/client';
import { Public } from 'src/authentication/decorator/public.decorator';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<WebResponseDto<boolean>> {
    return {
      data: await this.questionService.create(createQuestionDto),
    };
  }

  @Public()
  @Get()
  async findAll(): Promise<WebResponseDto<VerificationQuestion[]>> {
    return {
      data: await this.questionService.findAll(),
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<WebResponseDto<boolean>> {
    return {
      data: await this.questionService.update(+id, updateQuestionDto),
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return {
      data: await this.questionService.remove(+id),
    };
  }
}
