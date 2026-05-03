import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EvidenciasService {
  constructor(private prisma: PrismaService) {}

  async obtenerTodas() {
    console.log('📸 [obtenerTodas] Consultando todas las evidencias...');
    
    const resultados = await this.prisma.evidencia.findMany({
      orderBy: { fecha: 'desc' },
      include: {
        admin: {
          select: {
            id_persona: true,
            nombre_completo: true,
            nombre_usuario: true,
          }
        }
      }
    });
    
    return resultados;
  }

  async obtenerPorAdmin(idAdmin: number) {
    console.log(`📸 [obtenerPorAdmin] Buscando evidencias del admin ID: ${idAdmin}`);
    
    return await this.prisma.evidencia.findMany({
      where: { id_admin: idAdmin },
      orderBy: { fecha: 'desc' },
      include: {
        admin: {
          select: {
            id_persona: true,
            nombre_completo: true,
            nombre_usuario: true,
          }
        }
      }
    });
  }

  async crear(data: {
    url: string;
    origen: string;
    id_referencia?: number;
    id_admin: number;
  }) {
    console.log('💾 [crear] Guardando evidencia:', { origen: data.origen, ref: data.id_referencia });
    
    try {
      return await this.prisma.evidencia.create({
        data: {
          url: data.url,
          origen: data.origen,
          id_referencia: data.id_referencia,
          id_admin: data.id_admin,
          fecha: new Date(),
          like: false,
        },
        include: {
          admin: {
            select: {
              id_persona: true,
              nombre_completo: true,
              nombre_usuario: true,
            }
          }
        }
      });
    } catch (error) {
      console.error('❌ [crear] Error al guardar evidencia:', error);
      throw error;
    }
  }

  /**
   * ❤️ TOGGLE LIKE INTELIGENTE
   * Si la foto es una firma de pago, actualiza automáticamente el estado del pago.
   */
  async toggleLike(id: number) {
    console.log(`❤️ [toggleLike] Procesando evidencia ID: ${id}`);
    
    const evidencia = await this.prisma.evidencia.findUnique({
      where: { id }
    });
    
    if (!evidencia) {
      throw new NotFoundException('Evidencia no encontrada');
    }

    const nuevoEstadoLike = !evidencia.like;

    // Usamos una transacción para que si falla el pago, no se guarde el like (y viceversa)
    return await this.prisma.$transaction(async (tx) => {
      
      // 1. Actualizar el Like en la evidencia
      const evidenciaActualizada = await tx.evidencia.update({
        where: { id },
        data: { like: nuevoEstadoLike },
        include: {
          admin: {
            select: {
              id_persona: true,
              nombre_completo: true,
              nombre_usuario: true,
            }
          }
        }
      });

      // 2. Si el origen es 'pago_firma', sincronizamos con la tabla PagoTrabajador
      if (evidencia.origen === 'pago_firma' && evidencia.id_referencia) {
        console.log(`🔗 [Sincronización] Ajustando estado de pago ID: ${evidencia.id_referencia}`);
        
        await tx.pagoTrabajador.update({
          where: { id_pago: evidencia.id_referencia },
          data: { 
            // Si hay Like -> Pagado con firma. Si no -> Vuelve a Pendiente.
            estado_pago: nuevoEstadoLike ? 'Pagado con firma' : 'Pendiente' 
          }
        });
      }

      return evidenciaActualizada;
    });
  }

  async eliminar(id: number, idAdmin: number) {
    const evidencia = await this.prisma.evidencia.findFirst({
      where: { id, id_admin: idAdmin }
    });
    
    if (!evidencia) {
      throw new ForbiddenException('No autorizado para eliminar esta evidencia');
    }

    return await this.prisma.evidencia.delete({ where: { id } });
  }

  async eliminarTodas(idAdmin: number) {
    return await this.prisma.evidencia.deleteMany({
      where: { id_admin: idAdmin }
    });
  }

  async obtenerPorOrigen(origen: string, idAdmin?: number) {
    const where: any = { origen };
    if (idAdmin) where.id_admin = idAdmin;
    
    return await this.prisma.evidencia.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: {
        admin: {
          select: {
            id_persona: true,
            nombre_completo: true,
            nombre_usuario: true,
          }
        }
      }
    });
  }
}