/**
 * Parte el texto del contrato en bloques para pintarlo: "## Título" es un
 * encabezado de cláusula y una línea en blanco separa párrafos (mismo criterio
 * que el PDF del backend).
 */
export interface ContractBlock {
  kind: 'heading' | 'paragraph'
  text: string
}

export function contractBlocks(text: string): ContractBlock[] {
  const out: ContractBlock[] = []
  for (const raw of String(text || '').replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    const block = raw.trim()
    if (!block) continue
    if (/^#{1,2}\s/.test(block)) {
      const [first, ...rest] = block.split('\n')
      out.push({ kind: 'heading', text: (first || '').replace(/^#+\s*/, '') })
      if (rest.length) out.push({ kind: 'paragraph', text: rest.join('\n') })
    } else {
      out.push({ kind: 'paragraph', text: block })
    }
  }
  return out
}
