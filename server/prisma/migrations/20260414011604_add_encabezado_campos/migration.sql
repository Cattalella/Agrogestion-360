/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Animal` table. All the data in the column will be lost.
  - You are about to drop the column `valor_nuevo` on the `Auditoria` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `CatInsumos` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `CatInsumos` table. All the data in the column will be lost.
  - You are about to drop the column `especie_destino` on the `CatInsumos` table. All the data in the column will be lost.
  - You are about to drop the column `stock_minimo` on the `CatInsumos` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CatInsumos` table. All the data in the column will be lost.
  - You are about to drop the column `cant_inicial` on the `LoteInv` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `LoteInv` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_compra` on the `LoteInv` table. All the data in the column will be lost.
  - You are about to drop the column `numero_lote` on the `LoteInv` table. All the data in the column will be lost.
  - You are about to drop the column `proveedor` on the `LoteInv` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `LoteInv` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Recordatorio` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Recordatorio` table. All the data in the column will be lost.
  - You are about to drop the column `dosis` on the `RegVacuna` table. All the data in the column will be lost.
  - You are about to drop the column `lote_vacuna` on the `RegVacuna` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones` on the `RegVacuna` table. All the data in the column will be lost.
  - You are about to drop the column `cantidad` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_aprobacion` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_compra` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `motivo` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones_aprob` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `proveedor` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Solicitud` table. All the data in the column will be lost.
  - You are about to drop the `ConsumoInsumo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PagoTrabajador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trabajador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrabajoRealizado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Venta` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `actualizado_en` to the `Recordatorio` table without a default value. This is not possible if the table is not empty.
  - Made the column `proposito` on table `Recordatorio` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ConsumoInsumo" DROP CONSTRAINT "ConsumoInsumo_id_insumo_fkey";

-- DropForeignKey
ALTER TABLE "ConsumoInsumo" DROP CONSTRAINT "ConsumoInsumo_id_responsable_fkey";

-- DropForeignKey
ALTER TABLE "PagoTrabajador" DROP CONSTRAINT "PagoTrabajador_id_trabajador_fkey";

-- DropForeignKey
ALTER TABLE "PagoTrabajador" DROP CONSTRAINT "PagoTrabajador_id_trabajo_fkey";

-- DropForeignKey
ALTER TABLE "Recordatorio" DROP CONSTRAINT "Recordatorio_id_persona_fkey";

-- DropForeignKey
ALTER TABLE "TrabajoRealizado" DROP CONSTRAINT "TrabajoRealizado_id_trabajador_fkey";

-- DropForeignKey
ALTER TABLE "Venta" DROP CONSTRAINT "Venta_id_animal_fkey";

-- AlterTable
ALTER TABLE "Animal" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Auditoria" DROP COLUMN "valor_nuevo";

-- AlterTable
ALTER TABLE "CatInsumos" DROP COLUMN "categoria",
DROP COLUMN "createdAt",
DROP COLUMN "especie_destino",
DROP COLUMN "stock_minimo",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "LoteInv" DROP COLUMN "cant_inicial",
DROP COLUMN "createdAt",
DROP COLUMN "fecha_compra",
DROP COLUMN "numero_lote",
DROP COLUMN "proveedor",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Recordatorio" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "proposito" SET NOT NULL;

-- AlterTable
ALTER TABLE "RegVacuna" DROP COLUMN "dosis",
DROP COLUMN "lote_vacuna",
DROP COLUMN "observaciones";

-- AlterTable
ALTER TABLE "Solicitud" DROP COLUMN "cantidad",
DROP COLUMN "createdAt",
DROP COLUMN "fecha_aprobacion",
DROP COLUMN "fecha_compra",
DROP COLUMN "motivo",
DROP COLUMN "observaciones_aprob",
DROP COLUMN "proveedor",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "ConsumoInsumo";

-- DropTable
DROP TABLE "PagoTrabajador";

-- DropTable
DROP TABLE "Trabajador";

-- DropTable
DROP TABLE "TrabajoRealizado";

-- DropTable
DROP TABLE "Venta";

-- AddForeignKey
ALTER TABLE "Recordatorio" ADD CONSTRAINT "Recordatorio_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "Persona"("id_persona") ON DELETE CASCADE ON UPDATE CASCADE;
