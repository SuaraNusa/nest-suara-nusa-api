import { PartialType } from '@nestjs/swagger';
import { CreatePredictDto } from './create-predict.dto';

export class UpdatePredictDto extends PartialType(CreatePredictDto) {}
