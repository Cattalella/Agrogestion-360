import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class VentasService {
    constructor(private prisma: PrismaService) {}

    async listarVentas() {
        return this.prisma.venta.findMany({
            include: {
                Animal: {
                    include: {
                        especie: true,
                        estado: true
                    }
                }
            },
            orderBy: { fecha_venta: 'desc' }
        });
    }

    async obtenerVenta(id: number) {
        const venta = await this.prisma.venta.findUnique({
            where: { id_venta: id },
            include: {
                Animal: {
                    include: {
                        especie: true,
                        estado: true
                    }
                }
            }
        });

        if (!venta) {
            throw new NotFoundException('Venta no encontrada');
        }

        return venta;
    }

    async crearVenta(datos: any) {
        const animal = await this.prisma.animal.findUnique({
            where: { id_animal: datos.id_animal },
            include: { estado: true }
        });

        if (!animal) {
            throw new NotFoundException('Animal no encontrado');
        }

        // Solo animales SANOS pueden ser vendidos (RF.4.1.3 / RF.6.1.3)
        if (animal.estado?.nombre?.toLowerCase() !== 'sano') {
            throw new BadRequestException('Solo se pueden vender animales sanos');
        }

        const venta = await this.prisma.venta.create({
            data: {
                id_animal: datos.id_animal,
                fecha_venta: new Date(datos.fecha_venta),
                peso_venta: new Decimal(datos.peso_venta),
                precio_total: new Decimal(datos.precio_total),
                comprador: datos.comprador,
                num_factura: datos.num_factura,
                metodo_pago: datos.metodo_pago,
                observaciones: datos.observaciones
            }
        });

        // Actualizar estado del animal a "Vendido" automáticamente (RN.4.1.3)
        let estadoVendido = await this.prisma.estadoAni.findFirst({
            where: { nombre: 'Vendido' }
        });

        if (!estadoVendido) {
            estadoVendido = await this.prisma.estadoAni.create({
                data: { nombre: 'Vendido' }
            });
        }

        await this.prisma.animal.update({
            where: { id_animal: datos.id_animal },
            data: { id_estado_ani: estadoVendido.id_estado_ani }
        });

        return venta;
    }

    async actualizarVenta(id: number, datos: any) {
        const venta = await this.prisma.venta.findUnique({
            where: { id_venta: id }
        });

        if (!venta) {
            throw new NotFoundException('Venta no encontrada');
        }

        return this.prisma.venta.update({
            where: { id_venta: id },
            data: {
                fecha_venta: datos.fecha_venta ? new Date(datos.fecha_venta) : undefined,
                peso_venta: datos.peso_venta ? new Decimal(datos.peso_venta) : undefined,
                precio_total: datos.precio_total ? new Decimal(datos.precio_total) : undefined,
                comprador: datos.comprador,
                num_factura: datos.num_factura,
                metodo_pago: datos.metodo_pago,
                observaciones: datos.observaciones
            }
        });
    }

    async eliminarVenta(id: number) {
        const venta = await this.prisma.venta.findUnique({
            where: { id_venta: id },
            include: { Animal: true }
        });

        if (!venta) {
            throw new NotFoundException('Venta no encontrada');
        }

        // 🔧 CORREGIDO: devolver al estado 'Sano' (no 'Activo')
        // Ganado usa 'Sano' como estado base, no 'Activo'
        let estadoSano = await this.prisma.estadoAni.findFirst({
            where: { nombre: 'Sano' }
        });

        if (!estadoSano) {
            estadoSano = await this.prisma.estadoAni.create({
                data: { nombre: 'Sano' }
            });
        }

        await this.prisma.animal.update({
            where: { id_animal: venta.id_animal },
            data: { id_estado_ani: estadoSano.id_estado_ani }
        });

        return this.prisma.venta.delete({
            where: { id_venta: id }
        });
    }
}