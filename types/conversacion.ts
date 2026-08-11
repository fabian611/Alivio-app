export type MensajeChat = {
  id: string
  direccion: "in" | "out"
  cuerpo: string
  estado: string
  errorMensaje: string | null
  enviadoPor: string | null
  createdAt: string
}

export type Conversacion = {
  id: string
  telefono: string
  ventanaExpiraAt: string | null
  ultimoMensajeAt: string | null
  ventanaAbierta: boolean
  mensajes: MensajeChat[]
}
