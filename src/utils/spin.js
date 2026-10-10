export const pickIndex = (n) => Math.floor(Math.random() * n)
// Nova rotação para que o centro do segmento `i` pare no topo (ponteiro).
export function nextRotation(current, i, n) {
  const seg = 360 / n
  const center = i * seg + seg / 2
  return current - (current % 360) + 360 * 6 + (360 - center)
}
