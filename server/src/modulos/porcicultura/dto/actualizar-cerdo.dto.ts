import { PartialType } from '@nestjs/mapped-types';
import { CrearCerdoDto } from './crear-cerdo.dto';

export class ActualizarCerdoDto extends PartialType(CrearCerdoDto) {}