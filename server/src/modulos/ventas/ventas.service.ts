import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class VentasService {
    constructor(private prisma: PrismaService) {}

    async listarVentas() {
        return this.prisma.venta.findMany({
            include: {
                Animal: {
                    select: {
                        codigo_local: true,
                        num_ica_chapeta: true,
                        especie: {
                            select: { nombre: true }
                        }
                    }
                }
            },
            orderBy: { fecha_venta: 'desc' }
        });
    }

    async crearVenta(datos: CrearVentaDto) {
        // Verificar que el animal existe y está activo
        const animal = await this.prisma.animal.findUnique({
            where: { id_animal: datos.id_animal },
            include: { estado: true }
        });

        if (!animal) {
            throw new BadRequestException('Animal no encontrado');
        }

        if (animal.estado?.nombre !== 'Activo') {
            throw new BadRequestException('Solo se pueden vender animales activos');
        }

        // Crear la venta
        const venta = await this.prisma.venta.create({
            data: {
                id_animal: datos.id_animal,
                fecha_venta: new Date(datos.fecha_venta),
                peso_venta: new Decimal(datos.peso_venta),
                precio_total: new Decimal(datos.precio_total),
                comprador: datos.comprador,
                num_factura: datos.num_factura || null,
                metodo_pago: datos.metodo_pago || 'Efectivo',
                observaciones: datos.observaciones || null,
                updatedAt: new Date()
            },
            include: {
                Animal: {
                    select: {
                        codigo_local: true
                    }
                }
            }
        });

        // Actualizar estado del animal a "Vendido"
        const estadoVendido = await this.prisma.estadoAni.findFirst({
            where: { nombre: 'Vendido' }
        });

        if (estadoVendido) {
            await this.prisma.animal.update({
                where: { id_animal: datos.id_animal },
                data: { id_estado_ani: estadoVendido.id_estado_ani }
            });
        } else {
            // Si no existe el estado "Vendido", crearlo
            const nuevoEstado = await this.prisma.estadoAni.create({
                data: { nombre: 'Vendido' }
            });
            await this.prisma.animal.update({
                where: { id_animal: datos.id_animal },
                data: { id_estado_ani: nuevoEstado.id_estado_ani }
            });
        }

        return venta;
    }

    async obtenerVenta(id: number) {
        const venta = await this.prisma.venta.findUnique({
            where: { id_venta: id },
            include: {
                Animal: {
                    select: {
                        codigo_local: true,
                        especie: { select: { nombre: true } }
                    }
                }
            }
        });

        if (!venta) {
            throw new BadRequestException('Venta no encontrada');
        }

        return venta;
    }
}