import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ActualizarVentaDto } from './dto/actualizar-venta.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class VentasService {
    constructor(private prisma: PrismaService) {}

    // ============================================================
    // LISTAR VENTAS
    // ============================================================
    async listarVentas() {
        const ventas = await this.prisma.venta.findMany({
            include: {
                Animal: {
                    select: {
                        id_animal: true,
                        codigo_local: true,
                        num_ica_chapeta: true,
                        especie: {
                            select: { nombre: true }
                        },
                        estado: {
                            select: { nombre: true }
                        }
                    }
                }
            },
            orderBy: { fecha_venta: 'desc' }
        });

        return ventas.map(v => ({
            id_venta: v.id_venta,
            id_animal: v.id_animal,
            fecha_venta: v.fecha_venta,
            peso_venta: v.peso_venta,
            precio_total: v.precio_total,
            comprador: v.comprador,
            num_factura: v.num_factura,
            metodo_pago: v.metodo_pago,
            observaciones: v.observaciones,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
            Animal: v.Animal
        }));
    }

    // ============================================================
    // OBTENER VENTA POR ID
    // ============================================================
    async obtenerVenta(id: number) {
        const venta = await this.prisma.venta.findUnique({
            where: { id_venta: id },
            include: {
                Animal: {
                    select: {
                        codigo_local: true,
                        especie: { select: { nombre: true } },
                        estado: { select: { nombre: true } }
                    }
                }
            }
        });

        if (!venta) {
            throw new NotFoundException('Venta no encontrada');
        }

        return venta;
    }

    // ============================================================
    // CREAR VENTA
    // ============================================================
    async crearVenta(datos: CrearVentaDto, idAdmin: number) {
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
        await this.cambiarEstadoAnimal(datos.id_animal, 'Vendido');

        return venta;
    }

    // ============================================================
    // ACTUALIZAR VENTA
    // ============================================================
    async actualizarVenta(id: number, datos: ActualizarVentaDto) {
        const ventaExistente = await this.prisma.venta.findUnique({
            where: { id_venta: id },
            include: { Animal: true }
        });

        if (!ventaExistente) {
            throw new NotFoundException('Venta no encontrada');
        }

        const dataActualizar: any = {
            updatedAt: new Date()
        };

        if (datos.fecha_venta !== undefined) dataActualizar.fecha_venta = new Date(datos.fecha_venta);
        if (datos.peso_venta !== undefined) dataActualizar.peso_venta = new Decimal(datos.peso_venta);
        if (datos.precio_total !== undefined) dataActualizar.precio_total = new Decimal(datos.precio_total);
        if (datos.comprador !== undefined) dataActualizar.comprador = datos.comprador;
        if (datos.num_factura !== undefined) dataActualizar.num_factura = datos.num_factura;
        if (datos.metodo_pago !== undefined) dataActualizar.metodo_pago = datos.metodo_pago;
        if (datos.observaciones !== undefined) dataActualizar.observaciones = datos.observaciones;

        // Si cambia el animal, actualizar estados de ambos
        if (datos.id_animal !== undefined && datos.id_animal !== ventaExistente.id_animal) {
            // Revertir estado del animal anterior a "Activo"
            await this.cambiarEstadoAnimal(ventaExistente.id_animal, 'Activo');
            // Cambiar estado del nuevo animal a "Vendido"
            await this.cambiarEstadoAnimal(datos.id_animal, 'Vendido');
            dataActualizar.id_animal = datos.id_animal;
        }

        const ventaActualizada = await this.prisma.venta.update({
            where: { id_venta: id },
            data: dataActualizar,
            include: {
                Animal: {
                    select: {
                        codigo_local: true
                    }
                }
            }
        });

        return ventaActualizada;
    }

    // ============================================================
    // ELIMINAR VENTA (Y REVERTIR ESTADO DEL ANIMAL)
    // ============================================================
    async eliminarVenta(id: number) {
        const venta = await this.prisma.venta.findUnique({
            where: { id_venta: id }
        });

        if (!venta) {
            throw new NotFoundException('Venta no encontrada');
        }

        // Eliminar la venta
        await this.prisma.venta.delete({
            where: { id_venta: id }
        });

        // Revertir estado del animal a "Activo"
        await this.cambiarEstadoAnimal(venta.id_animal, 'Activo');

        return {
            mensaje: 'Venta eliminada correctamente y animal revertido a estado Activo'
        };
    }

    // ============================================================
    // MÉTODO AUXILIAR: CAMBIAR ESTADO DE UN ANIMAL
    // ============================================================
    private async cambiarEstadoAnimal(idAnimal: number, nombreEstado: string) {
        const estado = await this.prisma.estadoAni.findFirst({
            where: { nombre: nombreEstado }
        });

        if (!estado) {
            // Crear el estado si no existe
            const nuevoEstado = await this.prisma.estadoAni.create({
                data: { nombre: nombreEstado }
            });
            await this.prisma.animal.update({
                where: { id_animal: idAnimal },
                data: { id_estado_ani: nuevoEstado.id_estado_ani }
            });
        } else {
            await this.prisma.animal.update({
                where: { id_animal: idAnimal },
                data: { id_estado_ani: estado.id_estado_ani }
            });
        }
    }
}