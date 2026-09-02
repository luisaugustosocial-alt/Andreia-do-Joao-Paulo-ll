import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PoliticaPrivacidade() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <article className="container legal-card">
          <span className="section-kicker">PRIVACIDADE</span>
          <h1>Política de Privacidade</h1>
          <p className="legal-updated">Última atualização: 02/09/2026</p>

          <h2>1. Sobre esta política</h2>
          <p>Esta política explica como o site institucional do mandato da Vereadora Andreia do João Paulo II trata informações enviadas pelos cidadãos, especialmente por meio do Gabinete Online.</p>

          <h2>2. Dados que podem ser coletados</h2>
          <p>Quando você envia uma demanda, podem ser solicitados nome, telefone, e-mail, bairro ou comunidade, assunto, categoria e descrição da solicitação. Também são registrados o protocolo, o status e as atualizações necessárias para o acompanhamento.</p>

          <h2>3. Finalidade do uso</h2>
          <p>Os dados são utilizados para receber, organizar, analisar, encaminhar e acompanhar solicitações dirigidas ao mandato, bem como para manter contato com o cidadão quando necessário. Eles não devem ser utilizados para venda de cadastros ou finalidades comerciais alheias ao atendimento do mandato.</p>

          <h2>4. Proteção das informações</h2>
          <p>O site utiliza controle de acesso administrativo, regras de segurança no banco de dados, comunicação protegida por HTTPS e proteção adicional dos campos pessoais das novas demandas antes do armazenamento. A área pública de acompanhamento não exibe nome, telefone, e-mail, bairro ou descrição privada da solicitação.</p>

          <h2>5. Serviços utilizados</h2>
          <p>O site pode utilizar serviços de infraestrutura e armazenamento, como Firebase, Vercel e ImageKit, necessários para autenticação, banco de dados, publicação do site e hospedagem de imagens. O tratamento realizado por esses fornecedores também está sujeito às políticas e medidas de segurança de cada plataforma.</p>

          <h2>6. Compartilhamento e encaminhamento</h2>
          <p>Uma demanda poderá ser encaminhada a órgãos, setores ou autoridades competentes quando isso for necessário para buscar solução ou resposta. O compartilhamento deve se limitar às informações necessárias para o atendimento da solicitação.</p>

          <h2>7. Conservação e exclusão</h2>
          <p>As informações são mantidas pelo período necessário ao acompanhamento institucional, à prestação de contas e às obrigações aplicáveis. Demandas podem ser arquivadas no painel administrativo e, quando cabível, excluídas definitivamente.</p>

          <h2>8. Direitos do titular</h2>
          <p>O cidadão pode solicitar informações, correção ou exclusão de seus dados, observadas as hipóteses legais de conservação. O contato institucional disponível no rodapé do site pode ser utilizado para essas solicitações.</p>

          <h2>9. Alterações</h2>
          <p>Esta política poderá ser atualizada para refletir mudanças no site, nos serviços utilizados ou nas práticas de atendimento. A versão vigente será sempre publicada nesta página.</p>
        </article>
      </main>
      <Footer />
    </>
  )
}
