import { HttpException, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import PrismaService from '../common/prisma.service';
import ValidationService from '../common/validation.service';
import { QuestionValidation } from './question.validation';

@Injectable()
export class QuestionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const validatedQuestionValidation = this.validationService.validate(
      QuestionValidation.SAVE,
      createQuestionDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.verificationQuestion.create({
        data: validatedQuestionValidation,
      });
      return true;
    });
  }

  findAll() {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      return prismaTransaction.verificationQuestion.findMany({});
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} question`;
  }

  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<boolean> {
    const validatedQuestionValidationDto = this.validationService.validate(
      QuestionValidation.SAVE,
      updateQuestionDto,
    );
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.verificationQuestion
        .findFirstOrThrow({
          where: {
            id: id,
          },
        })
        .catch(() => {
          throw new HttpException('Verification Question not found', 404);
        });
      await prismaTransaction.verificationQuestion.update({
        where: {
          id: id,
        },
        data: validatedQuestionValidationDto,
      });
      return true;
    });
  }

  async remove(id: number): Promise<boolean> {
    return this.prismaService.$transaction(async (prismaTransaction) => {
      await prismaTransaction.verificationQuestion
        .findFirstOrThrow({
          where: {
            id: id,
          },
        })
        .catch(() => {
          throw new HttpException('Verification Question not found', 404);
        });
      await prismaTransaction.verificationQuestion.delete({
        where: {
          id: id,
        },
      });
      return true;
    });
  }
}
