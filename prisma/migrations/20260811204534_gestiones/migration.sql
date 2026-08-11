-- CreateTable
CREATE TABLE "gestiones" (
    "id" UUID NOT NULL,
    "credito_id" UUID NOT NULL,
    "compania_id" UUID,
    "negociador" TEXT NOT NULL,
    "tipo_contacto" TEXT NOT NULL,
    "negociacion" TEXT NOT NULL,
    "subaccion" TEXT,
    "fecha_compromiso" DATE,
    "compromiso_cliente" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gestiones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_gestiones_credito" ON "gestiones"("credito_id");

-- CreateIndex
CREATE INDEX "idx_gestiones_negociador" ON "gestiones"("negociador");

-- CreateIndex
CREATE INDEX "idx_gestiones_compania" ON "gestiones"("compania_id");

-- AddForeignKey
ALTER TABLE "gestiones" ADD CONSTRAINT "gestiones_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "creditos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gestiones" ADD CONSTRAINT "gestiones_compania_id_fkey" FOREIGN KEY ("compania_id") REFERENCES "companias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
