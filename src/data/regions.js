// x/y em % do mapa com nomes (mapa.jpg, 16:9). Descrições ainda não fornecidas: placeholders.
const ph = '[PLACEHOLDER]'
const r = (id, name, x, y, extra = {}) => ({ id, name, x, y, description: ph, resources: ph, dangers: ph, points: ph, ...extra })
export const regions = [
  r('prepucio-artico', 'Prepúcio Ártico', 48.8, 17.6),
  r('cordilheira-rachada', 'Cordilheira Rachada', 64, 26.8),
  r('triatlo-infernal', 'Triatlo Infernal', 38.8, 40.7),
  r('ruina-dos-cristais', 'Ruína dos Cristais', 69, 49.5),
  r('ilha-dos-segredos', 'Ilha dos Segredos', 57.3, 63.9),
  r('camocim', 'Camocim', 39.8, 71),
  r('maca-radiativa', 'Maçã Radiativa', 72, 78.2),
]
