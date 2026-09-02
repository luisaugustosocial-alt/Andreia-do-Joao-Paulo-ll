import Header from '../components/Header'
import Footer from '../components/Footer'

export default function TermosUso() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <article className="container legal-card">
          <span className="section-kicker">TERMOS</span>
          <h1>Termos de Uso</h1>
          <p className="legal-updated">Última atualização: 02/09/2026</p>

          <h2>1. Finalidade do site</h2>
          <p>Este é um site institucional do mandato da Vereadora Andreia do João Paulo II. Ele reúne informações sobre atuação parlamentar, agenda, proposições, transparência, notícias e canais de participação popular.</p>

          <h2>2. Gabinete Online</h2>
          <p>O Gabinete Online permite o envio de solicitações e o acompanhamento por protocolo. O envio de uma demanda não representa garantia de deferimento, execução imediata ou competência direta do mandato para resolver o pedido. Quando necessário, a solicitação poderá ser encaminhada ao órgão competente.</p>

          <h2>3. Responsabilidade do usuário</h2>
          <p>Ao utilizar os formulários, o usuário deve fornecer informações verdadeiras e evitar o envio de conteúdo ilegal, ofensivo, discriminatório, fraudulento, malicioso ou que viole direitos de terceiros.</p>

          <h2>4. Informações institucionais</h2>
          <p>Agenda, notícias, proposições, status e outros conteúdos podem ser atualizados a qualquer momento. Em caso de divergência com registros oficiais da Câmara Municipal ou de outro órgão público, prevalece o documento oficial emitido pela instituição competente.</p>

          <h2>5. Disponibilidade</h2>
          <p>O site pode passar por manutenções, atualizações ou interrupções temporárias. Não é possível garantir disponibilidade ininterrupta de todos os serviços.</p>

          <h2>6. Propriedade e uso do conteúdo</h2>
          <p>Textos, identidade visual, fotografias e demais conteúdos institucionais devem ser utilizados respeitando os direitos de autoria, imagem e demais direitos aplicáveis.</p>

          <h2>7. Privacidade</h2>
          <p>O tratamento de dados pessoais realizado por meio deste site é explicado na Política de Privacidade, que integra estes termos.</p>

          <h2>8. Alterações dos termos</h2>
          <p>Estes termos podem ser atualizados sempre que necessário. A versão publicada nesta página é a versão vigente.</p>
        </article>
      </main>
      <Footer />
    </>
  )
}
