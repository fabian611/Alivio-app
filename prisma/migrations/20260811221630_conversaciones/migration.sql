-- AlterTable
ALTER TABLE "creditos" ADD COLUMN     "telefono" TEXT;

-- CreateTable
CREATE TABLE "conversaciones" (
    "id" UUID NOT NULL,
    "credito_id" UUID NOT NULL,
    "compania_id" UUID,
    "telefono" TEXT NOT NULL,
    "canal" TEXT NOT NULL DEFAULT 'whatsapp',
    "ventana_expira_at" TIMESTAMPTZ(6),
    "ultimo_mensaje_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" UUID NOT NULL,
    "conversacion_id" UUID NOT NULL,
    "direccion" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "twilio_sid" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'queued',
    "error_mensaje" TEXT,
    "enviado_por" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_conversaciones_telefono" ON "conversaciones"("telefono");

-- CreateIndex
CREATE INDEX "idx_conversaciones_compania" ON "conversaciones"("compania_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversaciones_credito_id_telefono_canal_key" ON "conversaciones"("credito_id", "telefono", "canal");

-- CreateIndex
CREATE UNIQUE INDEX "mensajes_twilio_sid_key" ON "mensajes"("twilio_sid");

-- CreateIndex
CREATE INDEX "idx_mensajes_conversacion" ON "mensajes"("conversacion_id");

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "creditos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversaciones" ADD CONSTRAINT "conversaciones_compania_id_fkey" FOREIGN KEY ("compania_id") REFERENCES "companias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
