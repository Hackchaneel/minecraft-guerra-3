import { useState } from 'react'
import Section from '../components/Section.jsx'

const chapters = [
  {
    id: 'capitulo-1',
    label: 'Capítulo I',
    game: 'MG1',
    title: 'O Mundo de Antes e a Profecia de Murilo',
    paragraphs: [
      'Há muitos anos, o mundo do Minecraft não era como conhecemos hoje. Era um mundo vasto, de horizontes infinitos, oceanos, rios, florestas, montanhas, praias e muito mais.',
      'A humanidade prosperava em vilas e cidades como sempre viveu, mas a ganância e a exploração desenfreada dos recursos começaram a cobrar seu preço.',
      'Foi nessa época que surgiu o nome mais importante da nossa história: Murilo Nunes.',
      'Um arquiteto lendário e mestre da Redstone avançada, Murilo não era apenas um construtor, mas um visionário com uma conexão única com os segredos antigos do mundo. Ele começou a ter visões e, por meio de seus equipamentos, detectou que um desastre iminente estava por vir: um Grande Dilúvio. Uma purificação apocalíptica estava prestes a cobrir toda a terra e extinguir a humanidade.',
      'Enquanto muitos riam de suas previsões, Murilo Nunes sabia que tinha a missão de salvar a humanidade. E ele tinha um plano.'
    ]
  },
  {
    id: 'capitulo-2',
    label: 'Capítulo II',
    game: 'MG1',
    title: 'O Sacrifício',
    paragraphs: [
      'Murilo Nunes trabalhou incansavelmente. Ele descobriu que, concentrando energia e Redstone purificada em núcleos específicos, poderia criar os Cristais de Sustentação, capazes de desafiar a própria gravidade. Com a ajuda de poucas pessoas, escolheu os 12 biomas mais importantes e cruciais da natureza e executou o plano mais ambicioso que o mundo já viu.',
      'Murilo uniu os Cristais às maiores massas de terra que conseguiu e, em um evento que ficou conhecido como “O Reinício”, ativou a matriz.',
      'Sob o comando de Murilo, as 12 ilhas flutuantes — incluindo a Ilha Principal e biomas sagrados como o Lago dos Sábios e a Maçã Verde — começaram a subir.',
      'Porém, para que a magia funcionasse, a matriz principal no solo precisava de uma partida: alguém com o conhecimento de Murilo para operar o fluxo de energia enquanto todos subiam. Murilo Nunes, em um ato de heroísmo, despediu-se de seu povo e escolheu ficar para trás. Ele se sacrificou, permanecendo na superfície hostil para garantir que a humanidade tivesse um novo recomeço.'
    ]
  },
  {
    id: 'capitulo-3',
    label: 'Capítulo III',
    game: 'MG2',
    title: 'A Era de Ouro e a Queda',
    paragraphs: [
      'Anos se passaram, e nos ares a humanidade restabeleceu sua civilização. O sacrifício de Murilo Nunes era reverenciado em todas as ilhas, principalmente em uma que foi homenageada com o nome de Picos da Mixagem. Houve um período de paz e prosperidade, mas, como no mundo antigo, a ganância voltou a surgir.',
      'As ilhas eram limitadas e, junto disso, relatos começaram a surgir: os Cristais de Sustentação, a obra-prima de Murilo, estavam brilhando menos. A energia oscilava, e o medo da queda se tornou real. O desespero pela sobrevivência corroeu os laços entre as ilhas, dando início ao conflito que ficou conhecido como Minecraft Guerra 2. O domínio pelas maiores terras e, principalmente, pelo centro, onde ficava a Ilha Principal, tornou-se o único objetivo. As facções lutavam para garantir que seu lar fosse o último a cair no vácuo.'
    ]
  },
  {
    id: 'capitulo-4',
    label: 'Capítulo IV',
    game: 'MG2',
    title: 'O Coliseu',
    paragraphs: [
      'No auge do conflito, o que se temia aconteceu. As ilhas menores, cujos cristais estavam mais fracos, começaram a despencar no vácuo, uma a uma. O fim parecia inevitável. Em uma decisão desesperada e unânime, os sobreviventes das facções decidiram usar os fragmentos restantes das ilhas para construir uma estrutura final: o Coliseu.',
      'Erigido no centro de tudo, no topo da Ilha Principal, o Coliseu seria o campo de batalha definitivo. Ali seria decidida a disputa pela Ilha Principal e pelo trono dos vencedores. Porém, o que deveria se tornar a glória de alguns acabou sendo a queda de todos. O peso massivo do Coliseu e a sobrecarga de energia das batalhas apenas aceleraram o que já estava por vir. Os cristais não aguentaram. Como uma âncora, o Coliseu quebrou a órbita das ilhas e arrastou tudo consigo.',
      'E, junto com ele, todas as 12 ilhas caíram em direção ao mar esquecido abaixo. O impacto foi explosivo. As ilhas não apenas caíram: colidiram e se fundiram. O calor do Vulcão Infernal fundiu rochas. O Ártico e o Deserto se chocaram, criando uma cordilheira enorme. O mundo flutuante acabou, e os guerreiros caíram nas praias de um novo continente hostil, com suas memórias confusas e o oceano ao redor transformado pelos cristais em um veneno corrosivo, impróprio para contato. No fim, aqui começa a redenção de tudo e o preço a ser pago pela nossa ganância.'
    ]
  }
]

function AnimatedParagraph({ text }) {
  return (
    <p aria-label={text}>
      {Array.from(text).map((letter, index) => (
        <span
          className="story-letter"
          aria-hidden="true"
          key={`${index}-${letter}`}
          style={{ animationDelay: `${Math.min(index * 2, 900)}ms` }}
        >{letter}</span>
      ))}
    </p>
  )
}

export default function Story() {
  const [activeId, setActiveId] = useState(chapters[0].id)
  const activeChapter = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0]

  return (
    <div className="story-page">
      <Section title="A HISTÓRIA" subtitle="A história do Minecraft Guerra será revelada aos poucos, capítulo por capítulo.">
        <div className="story-release-note">📕 <span>CAPÍTULOS LIBERADOS · MG1 + MG2</span></div>
        <div className="story-book" aria-label="Livro da história do Minecraft Guerra 3">
          <nav className="story-book-index" aria-label="Capítulos da história">
            <h3>Capítulos</h3>
            <div className="story-chapter-list" role="tablist" aria-orientation="vertical">
              {chapters.map((chapter) => (
                <button
                  className={`story-chapter-tab${activeId === chapter.id ? ' active' : ''}`}
                  id={`${chapter.id}-tab`}
                  key={chapter.id}
                  type="button"
                  role="tab"
                  aria-selected={activeId === chapter.id}
                  aria-controls={`${chapter.id}-panel`}
                  onClick={() => setActiveId(chapter.id)}
                >
                  <span>{chapter.label}</span>
                  <strong>{chapter.title}</strong>
                </button>
              ))}
            </div>
            <p className="story-book-hint">Selecione um capítulo para ler.</p>
          </nav>
          <article
            className="story-book-page"
            key={activeChapter.id}
            id={`${activeChapter.id}-panel`}
            role="tabpanel"
            aria-labelledby={`${activeChapter.id}-tab`}
            tabIndex={0}
          >
            <div className="story-book-page-heading">
              <span>{activeChapter.label} · {activeChapter.game ?? 'MG1'}</span>
              <h3>{activeChapter.title}</h3>
            </div>
            <div className="story-book-text">
              {activeChapter.paragraphs.map((text) => <AnimatedParagraph key={text} text={text} />)}
            </div>
          </article>
        </div>
        <p className="story-coming-soon">A história continua… Novos capítulos serão revelados em breve.</p>
      </Section>
    </div>
  )
}
