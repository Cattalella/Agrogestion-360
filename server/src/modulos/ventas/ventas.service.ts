import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class VentasService {
  constructor(
    private prisma: PrismaService,
    private auditoria: AuditoriaService
  ) {}

  // ============================================================
  // 📌 GESTIÓN DE VENTAS (RF.4.1.3 y RF.6.1.3)
  // ============================================================

  private async obtenerIdEstadoVendido() {
    let estado = await this.prisma.estadoAni.findFirst({
      where: { nombre: { contains: 'Vendido', mode: 'insensitive' } }
    });

    if (!estado) {
      estado = await this.prisma.estadoAni.create({
        data: { nombre: 'Vendido' }
      });
    }

    return estado.id_estado_ani;
  }

  async listarVentas() {
    return this.prisma.venta.findMany({
      include: {
        Animal: {
          include: {
            especie: true
          }
        }
      },
      orderBy: { fecha_venta: 'desc' }
    });
  }

  async registrarVenta(datos: any) {
    const animal = await this.prisma.animal.findUnique({
      where: { id_animal: datos.id_animal },
      include: { estado: true }
    });

    if (!animal) throw new NotFoundException('Animal no encontrado');
    
    // Regla: Solo vender animales activos
    if (animal.estado.nombre !== 'Activo') {
      throw new BadRequestException('Solo se pueden vender animales en estado Activo');
    }

    const idVendido = await this.obtenerIdEstadoVendido();

    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1. Crear el registro de venta
      const venta = await tx.venta.create({
        data: {
          id_animal: datos.id_animal,
          fecha_venta: datos.fecha_venta ? new Date(datos.fecha_venta) : new Date(),
          peso_venta: new Decimal(datos.peso_total || datos.peso_venta || 0),
          precio_total: new Decimal(datos.precio_total || datos.precio_venta || 0),
          comprador: datos.comprador,
          num_factura: datos.num_factura || null,
          metodo_pago: datos.metodo_pago,
          observaciones: datos.observaciones || null,
          updatedAt: new Date()
        }
      });

      // 2. Actualizar estado del animal a "Vendido"
      await tx.animal.update({
        where: { id_animal: datos.id_animal },
        data: { 
          id_estado_ani: idVendido,
          updatedAt: new Date()
        }
      });

      return venta;
    });

    // 3. Registrar en Auditoría
    await this.auditoria.registrar({
      id_usuario: datos.id_usuario_actual || 1,
      accion: 'REGISTRO_VENTA',
      descripcion: `Venta de animal ID ${datos.id_animal} a ${datos.comprador} por $${datos.precio_total}`,
      entidad: 'Venta',
      id_entidad: resultado.id_venta,
      rol: 'Administrador'
    });

    return resultado;
  }
}
