import { PartialType } from '@nestjs/mapped-types';
import { CrearVentaDto } from './crear-venta.dto';

export class ActualizarVentaDto extends PartialType(CrearVentaDto) {}