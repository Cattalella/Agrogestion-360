import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PorciculturaService {
  constructor(private prisma: PrismaService) {}

  // ============================================================
  // 📌 GESTIÓN DE CERDOS (RF.6.1.1)
  // ============================================================

  private async obtenerIdEspeciePorcino() {
    let especie = await this.prisma.especie.findFirst({
      where: { nombre: { contains: 'Porcino', mode: 'insensitive' } }
    });

    if (!especie) {
      especie = await this.prisma.especie.findFirst({
        where: { nombre: { contains: 'Cerdo', mode: 'insensitive' } }
      });
    }

    if (!especie) {
      // Si no existe, la creamos (o podrías manejar un error)
      especie = await this.prisma.especie.create({
        data: { nombre: 'Porcino' }
      });
    }

    return especie.id_especie;
  }

  async listarCerdos() {
    const idPorcino = await this.obtenerIdEspeciePorcino();
    return this.prisma.animal.findMany({
      where: { id_especie: idPorcino },
      include: {
        estado: true,
        ubicacion: true
      },
      orderBy: { codigo_local: 'asc' }
    });
  }

  async registrarCerdo(datos: any) {
    const idPorcino = await this.obtenerIdEspeciePorcino();
    
    // Validar identificador único (RM.6.1.1)
    const existente = await this.prisma.animal.findUnique({
      where: { codigo_local: datos.codigo_local }
    });

    if (existente) {
      throw new BadRequestException(`Ya existe un animal con el código local ${datos.codigo_local}`);
    }

    return this.prisma.animal.create({
      data: {
        codigo_local: datos.codigo_local,
        num_ica_chapeta: datos.num_ica_chapeta || null,
        id_especie: idPorcino,
        id_estado_ani: datos.id_estado_ani || 1, // Por defecto Activo
        id_ubicacion: datos.id_ubicacion || 1,
        sexo: datos.sexo || 'H',
        raza: datos.raza || 'Landrace',
        fecha_nacimiento: new Date(datos.fecha_nacimiento),
        peso_actual: new Decimal(datos.peso_actual || 0),
        origen: datos.origen || 'Registro Inicial',
        foto_url: datos.foto_url || null,
        updatedAt: new Date()
      }
    });
  }

  // ============================================================
  // 📌 VACUNACIÓN DE CERDOS (RF.6.1.2)
  // ============================================================

  async registrarVacunacion(datos: any) {
    // Solo cerdos activos
    const cerdo = await this.prisma.animal.findUnique({
      where: { id_animal: datos.id_animal },
      include: { estado: true }
    });

    if (!cerdo || cerdo.estado.nombre !== 'Activo') {
      throw new BadRequestException('Solo se pueden vacunar cerdos en estado Activo');
    }

    return this.prisma.regVacuna.create({
      data: {
        id_animal: Number(datos.id_animal),
        id_vacuna: Number(datos.id_vacuna),
        fecha_aplicacion: new Date(datos.fecha_aplicacion),
        dosis: datos.dosis,
        lote_vacuna: datos.lote_vacuna,
        id_responsable: Number(datos.id_responsable || datos.responsable),
        observaciones: datos.observaciones
      }
    });
  }
}
