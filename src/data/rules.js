// Regras oficiais. Formato por linha: "- " item de lista · "# " subtítulo · "! " destaque · "> " exemplo · demais = parágrafo.
const c = (icon, title, text) => ({ icon, title, lines: text.trim().split('\n').map((l) => l.trim()).filter(Boolean) })
export const rules = [
c('🏁', 'INÍCIO DO EVENTO', `
Os jogadores serão divididos em grupos e receberão posições aleatórias por meio de uma roleta.
Enquanto todos não estiverem em suas posições, ninguém poderá se movimentar.
O grupo definido pela roleta não representa necessariamente uma aliança permanente. Após o início do evento, os jogadores poderão:
- Formar alianças;
- Fazer acordos;
- Trair outros jogadores;
- Mudar de grupo;
- Seguir sozinhos;
- Explorar livremente o mapa.`),
c('🕐', 'TEMPORIZADOR — PERÍODO DE PAZ', `
Após todos estarem posicionados, será iniciado um período de preparação.
Durante esse período, os jogadores poderão:
- Encontrar companheiros;
- Conhecer possíveis rivais;
- Explorar o território;
- Coletar recursos;
- Construir e se equipar.
! ⚠️ A guerra só começa oficialmente quando o temporizador chegar ao fim.
Antes disso, mortes causadas por jogadores não contarão como perda de vida.`),
c('❤️', 'SISTEMA DE VIDAS', `
Cada jogador começará com 3 vidas.
Ao perder todas as vidas, o jogador estará eliminado do evento.
# ❌ NÃO PERDE VIDA POR:
- Morte para mobs;
- Dano de queda;
- Afogamento convencional;
- Fome;
- Acidentes com lava;
- Sufocamento.
# ⚔️ PERDE VIDA POR:
- Ser morto diretamente por outro jogador após o fim do período de paz;
- Morrer como consequência direta de um combate entre jogadores.
> Exemplo:
> Um jogador está fugindo de outro durante um combate, entra no fogo enquanto tenta escapar e acaba morrendo. Nesse caso, a morte será considerada causada pelo adversário se o chat do jogo alegar isso.`),
c('🛡️', 'PROTEÇÃO APÓS A MORTE', `
Após perder uma vida, o jogador terá 10 minutos de proteção depois de renascer.
Durante esse período:
- O jogador não poderá ser morto novamente;
- O adversário que o matou não poderá persegui-lo deliberadamente;
- A proteção será válida tanto para quem renascer na base quanto para quem renascer no spawn do mundo.
! 🎯 O objetivo é impedir que um jogador seja eliminado repetidamente sem ter tempo para se reorganizar.`),
c('⏸️', 'PAUSA', `
Durante a sessão haverá uma pausa de 1 hora.
- O servidor será fechado durante a pausa;
- O servidor será reaberto quando os jogadores retornarem.
! ⚠️ Caso um jogador esteja mais de 10 minutos atrasado para o retorno:
- Sua localização poderá ser revelada aos demais jogadores;
- O jogador perderá 1 vida;
- A partida continuará normalmente, mesmo sem ele.`),
c('🏆', 'REPESCAGEM', `
# 6.1 — Última chance
Apenas jogadores que forem completamente eliminados durante a primeira sessão terão direito à repescagem.
# 6.2 — Arena PvP
Os jogadores eliminados participarão de uma arena PvP.
O vencedor, ou vencedores definidos pela Staff, poderão retornar ao evento com 1 vida extra.
# 6.3 — Retorno
Após retornar:
- O jogador poderá entrar em uma equipe existente caso haja vaga;
- Também poderá permanecer independente.
! ⚠️ Jogadores eliminados em sessões posteriores não terão uma nova repescagem.`),
c('👥', 'SISTEMA DE EQUIPES E ALIANÇAS', `
Cada equipe poderá possuir no máximo 6 jogadores oficiais.
As equipes poderão estabelecer relações diplomáticas entre si, incluindo:
- Compartilhamento de informações;
- Troca ou compartilhamento de recursos;
- Negociações;
- Pactos de não agressão;
- Acordos territoriais;
- Traições;
- Outros acordos diplomáticos.
! ⚠️ Uma aliança diplomática não altera a composição oficial das equipes e não permite ultrapassar o limite de 6 jogadores.`),
c('⚔️', 'INTERVENÇÃO E COOPERAÇÃO MILITAR ENTRE EQUIPES', `
# 8.1 — Intervenções são permitidas
Uma equipe pode entrar em uma batalha que já esteja acontecendo por iniciativa própria.
# 8.2 — Reforços combinados são proibidos
Duas ou mais equipes não podem planejar previamente uma operação militar conjunta para atacar o mesmo jogador ou equipe.
Isso inclui, por exemplo:
- Uma equipe atacar pela frente enquanto outra ataca pelos fundos;
- Combinar um cerco;
- Bloquear rotas de fuga de forma planejada;
- Combinar ataques simultâneos;
- Utilizar uma equipe como força de apoio militar previamente organizada.
# 8.3 — Ações independentes são permitidas
Duas equipes podem atacar o mesmo adversário durante o mesmo período desde que suas ações sejam independentes.
O simples fato de possuírem o mesmo objetivo não caracteriza uma infração.
# 8.4 — Diplomacia continua permitida
As equipes continuam livres para trocar informações, negociar, compartilhar recursos e estabelecer acordos.
Porém, esses acordos não podem ser utilizados para formar uma força militar conjunta que ultrapasse o limite oficial de 6 jogadores por equipe.
# 8.5 — Situações suspeitas
A Staff poderá analisar situações em que exista suspeita de cooperação militar previamente planejada.
Apenas o fato de duas equipes estarem lutando contra o mesmo adversário não será suficiente para caracterizar uma infração.
Entretanto, caso seja comprovada a existência de uma operação militar previamente coordenada entre as equipes, ambas poderão ser penalizadas pela Staff.`),
c('🔄', 'REORGANIZAÇÃO E FUSÃO DE EQUIPES', `
Caso uma equipe perca jogadores e seus sobreviventes desejem se reorganizar, eles poderão:
- Permanecer independentes;
- Entrar em outra equipe;
- Reintegrar-se a uma equipe existente.
! ⚠️ A equipe que receber novos jogadores deverá possuir vagas suficientes.
> Exemplo:
> Se a Equipe A possui 2 jogadores e deseja entrar na Equipe B, a Equipe B deverá possuir no máximo 4 jogadores.
! 🚫 O limite de 6 jogadores nunca poderá ser ultrapassado.`),
c('🟢', 'O QUE É UMA EQUIPE ATIVA?', `
Uma equipe será considerada ativa enquanto possuir pelo menos 1 jogador vivo que ainda pertença oficialmente a ela.
A equipe deixará de ser ativa quando:
- Seu último jogador vivo for eliminado; ou
- Seu último jogador abandonar oficialmente a equipe.
! ⚠️ Portanto, uma equipe com apenas 1 jogador sobrevivente ainda é uma equipe ativa.
> Exemplo:
> Se existem 3 equipes e uma delas possui apenas 1 sobrevivente, ainda existem 3 equipes ativas.`),
c('🔒', 'FASE FINAL — BLOQUEIO DE FUSÕES', `
A fase final começará automaticamente quando restarem apenas 2 equipes ativas.
A partir desse momento:
! 🚫 Não será permitido entrar em outra equipe;
! 🚫 Não será permitido abandonar uma equipe para criar ou entrar em outra;
! 🚫 Não serão permitidas fusões;
! 🚫 Não serão permitidas transferências de jogadores.
As duas equipes restantes deverão permanecer separadas até o fim.
! ⚠️ A quantidade de jogadores não importa para iniciar a fase final.
Pode acontecer, por exemplo:
> Equipe A: 6 jogadores
> Equipe B: 1 jogador
Mesmo assim, a fase final será iniciada.`),
c('🏹', 'CONFRONTO FINAL', `
Durante o confronto final:
- Não haverá vitória compartilhada;
- As duas equipes deverão permanecer separadas;
- A partida terminará quando uma equipe eliminar completamente a outra.
Caso as duas equipes se recusem a lutar e o confronto fique parado por tempo excessivo, a Staff poderá intervir.
Isso pode incluir:
- Fechamento gradual da área de combate;
- Arena final;
- Eventos especiais;
- Outras medidas necessárias para concluir a partida.`),
c('🗺️', 'DICAS DE SOBREVIVÊNCIA', `
O mapa será formado por um grande continente unificado.
⛏️ Os jogadores poderão explorar e minerar livremente pelo território.
# 🌊 Cuidado com o oceano:
A energia do cristal foi destruída e tornou as águas extremamente perigosas. Portanto, atravessar o oceano nadando pode não ser uma boa ideia.
# 🏛️ Centro / Coliseu:
A região central possui recursos raros, pontos estratégicos, segredos e outras situações que podem colocar os jogadores uns contra os outros.`),
c('⚠️', 'REGRAS GERAIS', `
! 🚫 Não será permitido utilizar:
- Texture packs que forneçam vantagem competitiva;
- Mods que forneçam vantagem competitiva;
- Recursos externos que forneçam informações ou vantagens que normalmente não estariam disponíveis no jogo.
🐛 Em casos envolvendo bugs, exploits ou situações não previstas nas regras, a Staff poderá analisar individualmente o caso e tomar a decisão necessária para preservar a integridade do evento.`),
c('🏆', 'FIM DO MINECRAFT GUERRA 3', `
O MG3 terminará quando existir:
- 1 equipe vencedora, após eliminar completamente a outra equipe na fase final;
- ou 1 jogador independente sobrevivente, caso ele seja o último participante restante.
🏆 Os vencedores chegarão ao centro do mapa e entrarão para a história como os maiores guerreiros do Minecraft Guerra 3.`),
]
