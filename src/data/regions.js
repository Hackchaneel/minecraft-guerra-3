// Coordenadas em % do mapa com nomes (mapa.jpg, 16:9).
const ph = '[PLACEHOLDER]'
const r = (id, name, x, y, extra = {}) => ({ id, name, x, y, description: ph, resources: ph, dangers: ph, points: ph, ...extra })

export const regions = [
  r('prepucio-artico', 'Prepúcio Ártico', 48.8, 17.6, {
    description: 'Uma ilha montanhosa e congelada, nascida do choque cataclísmico entre a antiga ilha do Ártico e as encostas gélidas dos Picos da Mixagem. É marcada por vastos campos de neve, relevo acidentado e uma grande calota polar de gelo flutuante ao norte. Possui elevações estratégicas herdadas dessa fusão tectônica e uma cratera natural protegida a leste.',
    resources: ['Madeira de abeto (spruce).', 'Neve e variados tipos de gelo: comum, compactado e azul.', 'Pedra, cascalho, podzol e minérios de montanha, como carvão, ferro e esmeraldas.'],
    dangers: '',
    points: [
      { title: 'Calota Polar (Norte)', text: 'Placas de gelo ideais para locomoção rápida com barcos.' },
      { title: 'Cratera (Leste)', text: 'Bacia circular cercada por montanhas, perfeita para montar base.' },
      { title: 'Picos Elevados', text: 'Garantem ótima visão sobre as ilhas vizinhas.' },
    ],
  }),
  r('cordilheira-rachada', 'Cordilheira Rachada', 64, 26.8, {
    description: 'Uma grande cadeia montanhosa de terrenos áridos e acidentados, nascida da colisão violenta entre a antiga Ilha Rachada e os relevos rochosos dos Picos da Mixagem. O impacto cataclísmico rasgou a terra ao meio, criando uma ravina profunda e falhas geológicas expostas que dividem a ilha em blocos maciços.',
    resources: ['Madeira de abeto (spruce), carvalho comum e caule de cogumelo.', 'Areia vermelha, terracota vermelha e formações rochosas.', 'Pedra, cascalho e abundância de minérios comuns e subterrâneos.'],
    dangers: '',
    points: [
      { title: 'O Cânion / Fenda Central', text: 'Um canal de água que corta a ilha, excelente para navegação rápida de barco ou rota de fuga furtiva.' },
      { title: 'Entrada Sem Saída no Mar', text: 'Uma baía aquática fechada no interior da ilha, perfeita para esconder uma base naval ou criar um porto protegido e difícil de invadir.' },
      { title: 'Paredões Elevados', text: 'Penhascos altos ideais para construção de bases aéreas ou postos de vigia.' },
    ],
  }),
  r('triatlo-infernal', 'Triatlo Infernal', 38.8, 40.7, {
    description: 'Uma zona extremamente hostil e incandescente, formada pela colisão brutal entre o antigo Vulcão Infernal e as extensões abrasadoras das Terras Áridas. O relevo é dominado por caldeiras vulcânicas ativas, rios de lava que cortam o terreno acidentado e formações rochosas calcinadas pelo calor extremo da catástrofe tectônica.',
    resources: ['Madeira e orgânicos: troncos carbonizados, madeira de carvalho e acácia, além de blocos de cogumelo.', 'Terreno e minerais: magma, obsidiana, netherrack, cascalho vulcânico, areia e terracota das antigas Terras Áridas.', 'Minérios profundos expostos pelas fendas de calor e depósitos abundantes de lava.'],
    dangers: [
      { title: 'Caldeiras e Rios de Lava', text: 'Múltiplas crateras vulcânicas ativas conectadas por fluxos incandescentes tornam a travessia a pé um risco constante.' },
    ],
    points: [
      { title: 'Zonas de Transição Árida', text: 'Encostas secas e planas herdadas das Terras Áridas, que servem como passagens estratégicas, porém totalmente descobertas.' },
      { title: 'Vantagem de Altitude das Crateras', text: 'Os topos dos vulcões oferecem visão panorâmica do quadrante sul do mapa, ideal para postos de vigia de alto risco.' },
    ],
  }),
  r('ruina-dos-cristais', 'Ruína dos Cristais', 69, 49.5, {
    description: 'Uma ilha caótica e exótica, marcada para sempre como o local onde ocorreu a maior concentração da energia dos cristais de sustentação. Devido a esse colapso energético, tornou-se a zona mais radioativa e perigosa de todo o mapa, onde a paisagem foi totalmente corrompida por formações cristalinas gigantescas de coloração roxa e magenta.',
    resources: ['Caule de cogumelo e blocos de cogumelos gigantes.', 'Concretos coloridos, pó de concreto colorido e grandes formações de cristais.', 'Blocos de neve e minérios raros ocultos nas fendas rochosas.'],
    dangers: [
      { title: 'Zona de Perigo Extremo', text: 'A mistura de lava, neve e água tóxica cria armadilhas naturais fatais.' },
    ],
    points: [
      { title: 'Epicentro Radioativo', text: 'Local exato da catástrofe com os cristais de sustentação; área de alto risco e recompensa (loot).' },
      { title: 'Picos de Cristais', text: 'Pontos de observação estratégicos, mas que deixam os jogadores muito expostos.' },
      { title: 'Terreno Labiríntico', text: 'Fendas e valas perfeitas para emboscadas, porém difíceis para fugas rápidas.' },
    ],
  }),
  r('ilha-dos-segredos', 'Ilha dos Segredos', 57.3, 63.9),
  r('camocim', 'Camocim', 39.8, 71),
  r('maca-radiativa', 'Maçã Radiativa', 72, 78.2),
]
