import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

import { PrismaClient } from "../lib/generated/prisma/client"

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  }),
})

const SEED_COMPANIAS = [
  {
    nit: "900123456-7",
    nombre: "Want N' Get S.A.S.",
    nombreCorto: "WANG",
    fechaInicial: new Date("2024-01-15"),
    urlCargue: "https://cargue.wantnget.com.co",
  },
  {
    nit: "901987654-3",
    nombre: "Alivio Financiero S.A.",
    nombreCorto: "ALIVIO",
    fechaInicial: new Date("2025-03-01"),
    urlCargue: null,
  },
]

const SEED_USERS = [
  {
    name: "Ana Torres",
    email: "admin@alivio.co",
    password: "Admin123*",
    role: "admin",
    cargo: "Directora de operaciones",
    compania: "900123456-7",
  },
  {
    name: "Bruno Salas",
    email: "negociador@alivio.co",
    password: "Negociador123*",
    role: "negociador",
    cargo: "Negociador senior",
    compania: "900123456-7",
  },
  {
    name: "Diana Rojas",
    email: "negociador2@alivio.co",
    password: "Negociador123*",
    role: "negociador",
    cargo: "Negociadora",
    compania: "900123456-7",
  },
  {
    name: "Carla Ruiz",
    email: "gestor@alivio.co",
    password: "Gestor123*",
    role: "gestor",
    cargo: "Gestora de cartera",
    compania: "900123456-7",
  },
  {
    name: "Elena Prada",
    email: "gestor2@alivio.co",
    password: "Gestor123*",
    role: "gestor",
    cargo: "Gestora de cartera",
    compania: "901987654-3",
  },
]

const PAGADURIAS = [
  "Ministerio de Educación",
  "Gobernación del Valle",
  "Alcaldía de Medellín",
  "Fiduprevisora",
]

function creditosPara(companiaId: string, prefijo: string, cantidad: number) {
  return Array.from({ length: cantidad }, (_, index) => {
    const saldoCapital = 2_000_000 + index * 517_300
    const diasMoraAct = [0, 5, 12, 28, 45, 63, 91, 120][index % 8]

    return {
      pagaduria: PAGADURIAS[index % PAGADURIAS.length],
      nroCredito: `${prefijo}-${String(index + 1).padStart(5, "0")}`,
      idDeudor: `${1000000000 + index * 7919}`,
      deudor: `Deudor ${prefijo} ${index + 1}`,
      valorCredito: saldoCapital * 1.35,
      saldoCapital,
      saldoIntereses: Math.round(saldoCapital * 0.08),
      saldoCuentas: Math.round(saldoCapital * 0.015),
      cuotaMes: Math.round(saldoCapital / 36),
      cuotasTotal: 36,
      diasMoraIni: Math.max(0, diasMoraAct - 15),
      diasMoraAct,
      companiaId,
    }
  })
}

async function main() {
  const companias = new Map<string, string>()

  for (const compania of SEED_COMPANIAS) {
    const row = await prisma.compania.upsert({
      where: { nit: compania.nit },
      update: compania,
      create: compania,
    })

    companias.set(compania.nit, row.id)
    console.log(`✔ compañía   ${row.nombre}`)
  }

  for (const { password, compania, ...user } of SEED_USERS) {
    const passwordHash = await bcrypt.hash(password, 12)
    const companiaId = companias.get(compania) ?? null

    await prisma.user.upsert({
      where: { email: user.email },
      update: { ...user, passwordHash, companiaId, active: true },
      create: { ...user, passwordHash, companiaId },
    })

    console.log(`✔ ${user.role.padEnd(11)} ${user.email}`)
  }

  const wang = companias.get("900123456-7")!
  const alivio = companias.get("901987654-3")!

  const existentes = await prisma.credito.count()

  if (existentes === 0) {
    await prisma.credito.createMany({
      data: [
        ...creditosPara(wang, "WANG", 24),
        ...creditosPara(alivio, "ALV", 12),
      ],
    })
  }

  console.log(`✔ créditos    ${await prisma.credito.count()} en total`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
