export type Compania = {
  id: string
  nit: string | null
  nombre: string
  nombreCorto: string | null
  fechaInicial: string | null
  urlCargue: string | null
  createdAt: string
  _count: { usuarios: number }
}

export type CompaniaFormValues = {
  nit: string
  nombre: string
  nombreCorto: string
  fechaInicial: string
  urlCargue: string
}

export type ApiFieldErrors = Partial<Record<keyof CompaniaFormValues, string[]>>
