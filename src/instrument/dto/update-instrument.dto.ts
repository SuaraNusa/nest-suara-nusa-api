import { CreateInstrumentDto } from './create-instrument.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateInstrumentDto extends PartialType(CreateInstrumentDto) {
  deletedFiles: number[];
}
