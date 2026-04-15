/*
  Warnings:

  - Added the required column `updatedAt` to the `Animal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoria` to the `CatInsumos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CatInsumos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cant_inicial` to the `LoteInv` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LoteInv` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cantidad` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_compra` to the `Solicitud` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Solicitud` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Animal" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Auditoria" ADD COLUMN     "valor_nuevo" TEXT;

-- AlterTable
ALTER TABLE "CatInsumos" ADD COLUMN     "categoria" VARCHAR(50) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "especie_destino" VARCHAR(50),
ADD COLUMN     "stock_minimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LoteInv" ADD COLUMN     "cant_inicial" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_compra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "numero_lote" VARCHAR(50),
ADD COLUMN     "proveedor" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Persona" ADD COLUMN     "color_subtitulo" VARCHAR(7) DEFAULT '#000000',
ADD COLUMN     "color_titulo" VARCHAR(7) DEFAULT '#000000',
ADD COLUMN     "foto_perfil" TEXT,
ADD COLUMN     "wallpaper_url" TEXT;

-- AlterTable
ALTER TABLE "RegVacuna" ADD COLUMN     "dosis" VARCHAR(50),
ADD COLUMN     "lote_vacuna" VARCHAR(50),
ADD COLUMN     "observaciones" TEXT;

-- AlterTable
ALTER TABLE "Solicitud" ADD COLUMN     "cantidad" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_aprobacion" TIMESTAMP(3),
ADD COLUMN     "fecha_compra" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "motivo" TEXT,
ADD COLUMN     "observaciones_aprob" TEXT,
ADD COLUMN     "proveedor" VARCHAR(100),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Recordatorio" (
    "id" TEXT NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "proposito" TEXT,
    "cumplido" BOOLEAN NOT NULL DEFAULT false,
    "fecha_cumplida" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recordatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id_venta" SERIAL NOT NULL,
    "id_animal" INTEGER NOT NULL,
    "fecha_venta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "peso_venta" DECIMAL(10,2) NOT NULL,
    "precio_total" DECIMAL(12,2) NOT NULL,
    "comprador" VARCHAR(150) NOT NULL,
    "num_factura" VARCHAR(50),
    "metodo_pago" VARCHAR(30) NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id_venta")
);

-- CreateTable
CREATE TABLE "ConsumoInsumo" (
    "id_consumo" SERIAL NOT NULL,
    "id_insumo" INTEGER NOT NULL,
    "id_responsable" INTEGER NOT NULL,
    "actividad" VARCHAR(50) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "fecha_consumo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsumoInsumo_pkey" PRIMARY KEY ("id_consumo")
);

-- CreateTable
CREATE TABLE "Trabajador" (
    "id_trabajador" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "tipo_documento" VARCHAR(20) NOT NULL,
    "num_documento" VARCHAR(20) NOT NULL,
    "tipo_trabajo" VARCHAR(50) NOT NULL,
    "telefono" VARCHAR(20),
    "telefono_familiar" VARCHAR(20),
    "direccion" VARCHAR(200),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "fecha_ingreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trabajador_pkey" PRIMARY KEY ("id_trabajador")
);

-- CreateTable
CREATE TABLE "TrabajoRealizado" (
    "id_trabajo" SERIAL NOT NULL,
    "id_trabajador" INTEGER NOT NULL,
    "categoria_trabajo" VARCHAR(50) NOT NULL,
    "tipo_actividad" VARCHAR(100) NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "duracion_horas" DECIMAL(5,2) NOT NULL,
    "evidencia_url" VARCHAR(500) NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrabajoRealizado_pkey" PRIMARY KEY ("id_trabajo")
);

-- CreateTable
CREATE TABLE "PagoTrabajador" (
    "id_pago" SERIAL NOT NULL,
    "id_trabajador" INTEGER NOT NULL,
    "id_trabajo" INTEGER,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "concepto" VARCHAR(200) NOT NULL,
    "estado_pago" VARCHAR(30) NOT NULL,
    "firma_url" VARCHAR(500),
    "justificacion_anulacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagoTrabajador_pkey" PRIMARY KEY ("id_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trabajador_num_documento_key" ON "Trabajador"("num_documento");

-- AddForeignKey
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoInsumo" ADD CONSTRAINT "ConsumoInsumo_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "CatInsumos"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoInsumo" ADD CONSTRAINT "ConsumoInsumo_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrabajoRealizado" ADD CONSTRAINT "TrabajoRealizado_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "Trabajador"("id_trabajador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoTrabajador" ADD CONSTRAINT "PagoTrabajador_id_trabajador_fkey" FOREIGN KEY ("id_trabajador") REFERENCES "Trabajador"("id_trabajador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoTrabajador" ADD CONSTRAINT "PagoTrabajador_id_trabajo_fkey" FOREIGN KEY ("id_trabajo") REFERENCES "TrabajoRealizado"("id_trabajo") ON DELETE SET NULL ON UPDATE CASCADE;
