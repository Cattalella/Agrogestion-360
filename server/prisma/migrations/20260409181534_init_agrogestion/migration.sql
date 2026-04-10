-- CreateTable
CREATE TABLE "Rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(50) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "CatalogoDoc" (
    "id_tipo_doc" SERIAL NOT NULL,
    "nombre_tipo" VARCHAR(50) NOT NULL,

    CONSTRAINT "CatalogoDoc_pkey" PRIMARY KEY ("id_tipo_doc")
);

-- CreateTable
CREATE TABLE "EstadoPers" (
    "id_estado" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "EstadoPers_pkey" PRIMARY KEY ("id_estado")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id_persona" SERIAL NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "id_tipo_doc" INTEGER NOT NULL,
    "id_estado" INTEGER NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "num_documento" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "telefono" VARCHAR(20),
    "nombre_usuario" VARCHAR(50),
    "contrasena_hash" VARCHAR(255),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id_persona")
);

-- CreateTable
CREATE TABLE "RecuperacionClave" (
    "id_token" SERIAL NOT NULL,
    "id_persona" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RecuperacionClave_pkey" PRIMARY KEY ("id_token")
);

-- CreateTable
CREATE TABLE "Especie" (
    "id_especie" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "Especie_pkey" PRIMARY KEY ("id_especie")
);

-- CreateTable
CREATE TABLE "EstadoAni" (
    "id_estado_ani" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,

    CONSTRAINT "EstadoAni_pkey" PRIMARY KEY ("id_estado_ani")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id_ubicacion" SERIAL NOT NULL,
    "nombre_ubi" VARCHAR(50) NOT NULL,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id_ubicacion")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id_animal" SERIAL NOT NULL,
    "num_ica_chapeta" VARCHAR(50),
    "codigo_local" VARCHAR(20) NOT NULL,
    "id_especie" INTEGER NOT NULL,
    "id_estado_ani" INTEGER NOT NULL,
    "id_ubicacion" INTEGER NOT NULL,
    "sexo" CHAR(1) NOT NULL,
    "raza" VARCHAR(50) NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "peso_actual" DECIMAL(10,2) NOT NULL,
    "origen" VARCHAR(50) NOT NULL,
    "foto_url" VARCHAR(255),

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id_animal")
);

-- CreateTable
CREATE TABLE "HistorialPeso" (
    "id_peso" SERIAL NOT NULL,
    "id_animal" INTEGER NOT NULL,
    "peso" DECIMAL(10,2) NOT NULL,
    "fecha_pesaje" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialPeso_pkey" PRIMARY KEY ("id_peso")
);

-- CreateTable
CREATE TABLE "CatVacunas" (
    "id_vacuna" SERIAL NOT NULL,
    "nombre_vacuna" VARCHAR(100) NOT NULL,

    CONSTRAINT "CatVacunas_pkey" PRIMARY KEY ("id_vacuna")
);

-- CreateTable
CREATE TABLE "RegVacuna" (
    "id_reg_vac" SERIAL NOT NULL,
    "id_animal" INTEGER NOT NULL,
    "id_vacuna" INTEGER NOT NULL,
    "id_responsable" INTEGER NOT NULL,
    "fecha_aplicacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegVacuna_pkey" PRIMARY KEY ("id_reg_vac")
);

-- CreateTable
CREATE TABLE "CatInsumos" (
    "id_insumo" SERIAL NOT NULL,
    "nombre_insumo" VARCHAR(100) NOT NULL,
    "unidad_medida" VARCHAR(20) NOT NULL,

    CONSTRAINT "CatInsumos_pkey" PRIMARY KEY ("id_insumo")
);

-- CreateTable
CREATE TABLE "Solicitud" (
    "id_solicitud" SERIAL NOT NULL,
    "id_insumo" INTEGER NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "id_dueno" INTEGER NOT NULL,
    "estado_sol" VARCHAR(20) NOT NULL,

    CONSTRAINT "Solicitud_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "LoteInv" (
    "id_lote" SERIAL NOT NULL,
    "id_insumo" INTEGER NOT NULL,
    "cant_actual" DECIMAL(10,2) NOT NULL,
    "fecha_venc" TIMESTAMP(3),

    CONSTRAINT "LoteInv_pkey" PRIMARY KEY ("id_lote")
);

-- CreateTable
CREATE TABLE "Auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accion" VARCHAR(50) NOT NULL,
    "tabla_afectada" VARCHAR(50) NOT NULL,
    "valor_anterior" TEXT,

    CONSTRAINT "Auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_rol_key" ON "Rol"("nombre_rol");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_num_documento_key" ON "Persona"("num_documento");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_email_key" ON "Persona"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_nombre_usuario_key" ON "Persona"("nombre_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "RecuperacionClave_token_hash_key" ON "RecuperacionClave"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_num_ica_chapeta_key" ON "Animal"("num_ica_chapeta");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_codigo_local_key" ON "Animal"("codigo_local");

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "Rol"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_id_tipo_doc_fkey" FOREIGN KEY ("id_tipo_doc") REFERENCES "CatalogoDoc"("id_tipo_doc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_id_estado_fkey" FOREIGN KEY ("id_estado") REFERENCES "EstadoPers"("id_estado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecuperacionClave" ADD CONSTRAINT "RecuperacionClave_id_persona_fkey" FOREIGN KEY ("id_persona") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_id_especie_fkey" FOREIGN KEY ("id_especie") REFERENCES "Especie"("id_especie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_id_estado_ani_fkey" FOREIGN KEY ("id_estado_ani") REFERENCES "EstadoAni"("id_estado_ani") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_id_ubicacion_fkey" FOREIGN KEY ("id_ubicacion") REFERENCES "Ubicacion"("id_ubicacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialPeso" ADD CONSTRAINT "HistorialPeso_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegVacuna" ADD CONSTRAINT "RegVacuna_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "Animal"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegVacuna" ADD CONSTRAINT "RegVacuna_id_vacuna_fkey" FOREIGN KEY ("id_vacuna") REFERENCES "CatVacunas"("id_vacuna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegVacuna" ADD CONSTRAINT "RegVacuna_id_responsable_fkey" FOREIGN KEY ("id_responsable") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "CatInsumos"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Solicitud" ADD CONSTRAINT "Solicitud_id_dueno_fkey" FOREIGN KEY ("id_dueno") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteInv" ADD CONSTRAINT "LoteInv_id_insumo_fkey" FOREIGN KEY ("id_insumo") REFERENCES "CatInsumos"("id_insumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditoria" ADD CONSTRAINT "Auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Persona"("id_persona") ON DELETE RESTRICT ON UPDATE CASCADE;
