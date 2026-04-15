// src/compartido/tuberias/validacion.tuberia.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidacionTuberia implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.validarMetatype(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const mensajes = errors.map((error) => ({
        campo: error.property,
        errores: Object.values(error.constraints || {}),
      }));
      
      throw new BadRequestException({
        mensaje: 'Error de validación',
        errores: mensajes,
      });
    }

    return object;
  }

  private validarMetatype(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}