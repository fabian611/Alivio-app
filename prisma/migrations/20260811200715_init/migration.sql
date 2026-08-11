-- CreateTable
CREATE TABLE "companias" (
    "id" UUID NOT NULL,
    "nit" TEXT,
    "nombre" TEXT NOT NULL,
    "nombre_corto" TEXT,
    "fecha_inicial" DATE,
    "url_cargue" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "companias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMPTZ(6),
    "image" TEXT,
    "password" TEXT NOT NULL,
    "cargo" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'gestor',
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "compania_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditos" (
    "id" UUID NOT NULL,
    "pagaduria" TEXT,
    "nro_credito" TEXT,
    "id_deudor" TEXT,
    "deudor" TEXT,
    "valor_credito" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "saldo_capital" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "saldo_intereses" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "saldo_cuentas" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cuota_mes" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "cuotas_total" INTEGER NOT NULL DEFAULT 0,
    "dias_mora_ini" INTEGER NOT NULL DEFAULT 0,
    "dias_mora_act" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'sin_tratar',
    "regla" TEXT NOT NULL DEFAULT '',
    "responsable" TEXT NOT NULL DEFAULT '',
    "responsables" TEXT[],
    "canal" TEXT[],
    "compania_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creditos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reglas" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "condiciones" JSONB NOT NULL,
    "canal" TEXT[],
    "responsables" TEXT[],
    "compania_id" UUID,
    "creada_por" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reglas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tratamientos" (
    "id" UUID NOT NULL,
    "credito_id" UUID NOT NULL,
    "compania_id" UUID,
    "regla" TEXT,
    "responsable" TEXT,
    "responsables" TEXT[],
    "canal" TEXT[],
    "condiciones" TEXT,
    "aplicado_por" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tratamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateIndex
CREATE UNIQUE INDEX "companias_nit_key" ON "companias"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_compania_id_idx" ON "usuarios"("compania_id");

-- CreateIndex
CREATE INDEX "idx_creditos_compania" ON "creditos"("compania_id");

-- CreateIndex
CREATE INDEX "idx_creditos_estado" ON "creditos"("estado");

-- CreateIndex
CREATE INDEX "idx_creditos_responsable" ON "creditos"("responsable");

-- CreateIndex
CREATE INDEX "idx_creditos_nro" ON "creditos"("nro_credito");

-- CreateIndex
CREATE INDEX "idx_creditos_id_deudor" ON "creditos"("id_deudor");

-- CreateIndex
CREATE INDEX "idx_reglas_compania" ON "reglas"("compania_id");

-- CreateIndex
CREATE INDEX "idx_tratamientos_credito" ON "tratamientos"("credito_id");

-- CreateIndex
CREATE INDEX "idx_tratamientos_compania" ON "tratamientos"("compania_id");

-- CreateIndex
CREATE INDEX "idx_tratamientos_aplicado" ON "tratamientos"("aplicado_por");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_compania_id_fkey" FOREIGN KEY ("compania_id") REFERENCES "companias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creditos" ADD CONSTRAINT "creditos_compania_id_fkey" FOREIGN KEY ("compania_id") REFERENCES "companias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reglas" ADD CONSTRAINT "reglas_compania_id_fkey" FOREIGN KEY ("compania_id") REFERENCES "companias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamientos" ADD CONSTRAINT "tratamientos_credito_id_fkey" FOREIGN KEY ("credito_id") REFERENCES "creditos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamientos" ADD CONSTRAINT "tratamientos_compania_id_fkey" FOREIGN KEY ("compania_id") REFERENCES "companias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
