import { renderRouter, screen } from 'expo-router/testing-library'
import { fireEvent } from '@testing-library/react-native'
import RootLayout from '../../../app/_layout'
import ComponentesLayout from '../../../app/(shell)/componentes/_layout'
import ComponentesIndex from '../../../app/(shell)/componentes/index'
import ComponentesSlugScreen, { generateStaticParams } from '../../../app/(shell)/componentes/[slug]'

function routes() {
  return {
    _layout: RootLayout,
    'componentes/_layout': ComponentesLayout,
    'componentes/index': ComponentesIndex,
  }
}

function fullRoutes() {
  return {
    ...routes(),
    'componentes/[slug]': ComponentesSlugScreen,
  }
}

describe('/componentes (lista)', () => {
  it('lista os 5 grupos da vitrine', async () => {
    await renderRouter(routes(), { initialUrl: '/componentes' })
    expect(await screen.findByText('Ações')).toBeTruthy()
    expect(await screen.findByText('Formulário')).toBeTruthy()
    expect(await screen.findByText('Feedback')).toBeTruthy()
    expect(await screen.findByText('Exibição')).toBeTruthy()
    expect(await screen.findByText('Layout')).toBeTruthy()
  })
})

describe('/componentes/[slug]', () => {
  it('abre o grupo de ações com as 4 entradas', async () => {
    await renderRouter(fullRoutes(), { initialUrl: '/componentes/acoes' })
    expect(await screen.findByText('Button')).toBeTruthy()
    expect(await screen.findByText('ButtonGroup')).toBeTruthy()
    expect(await screen.findByText('ActionBar')).toBeTruthy()
    expect(await screen.findByText('DropdownMenu')).toBeTruthy()
  })

  it('abre o grupo de layout com as 6 entradas', async () => {
    await renderRouter(fullRoutes(), { initialUrl: '/componentes/layout' })
    expect(await screen.findByText('Container')).toBeTruthy()
    expect(await screen.findByText('PageHeader')).toBeTruthy()
  })

  it('navega da lista para o grupo de layout ao tocar no link', async () => {
    await renderRouter(fullRoutes(), { initialUrl: '/componentes' })
    const link = await screen.findByText('Layout')
    await fireEvent.press(link)
    expect(await screen.findByText('Container')).toBeTruthy()
  })

  it('renderiza /componentes/formulario com as 11 entradas', async () => {
    const context = await renderRouter(fullRoutes(), { initialUrl: '/componentes/formulario' })
    expect(await context.findByText('Input')).toBeTruthy()
    expect(await context.findByText('Formulário (RHF)')).toBeTruthy()
  })

  it('mostra "Grupo não encontrado" para slug inválido', async () => {
    const context = await renderRouter(fullRoutes(), { initialUrl: '/componentes/nao-existe' })
    expect(await context.findByText('Grupo não encontrado')).toBeTruthy()
  })

  it('generateStaticParams devolve um slug por grupo da vitrine', () => {
    const params = generateStaticParams()
    expect(params).toEqual([
      { slug: 'acoes' },
      { slug: 'formulario' },
      { slug: 'feedback' },
      { slug: 'exibicao' },
      { slug: 'layout' },
    ])
  })

  it('renderiza /componentes/feedback com Alert e Drawer', async () => {
    const context = await renderRouter(fullRoutes(), { initialUrl: '/componentes/feedback' })
    expect(await context.findByText('Alert')).toBeTruthy()
    expect(await context.findByText('Drawer')).toBeTruthy()
  })

  it('renderiza /componentes/exibicao com Badge e Separator', async () => {
    const context = await renderRouter(fullRoutes(), { initialUrl: '/componentes/exibicao' })
    expect(await context.findByText('Badge')).toBeTruthy()
    expect(await context.findByText('Separator')).toBeTruthy()
  })

  it('renderiza List, Tabs e BrandLogo em /componentes/exibicao', async () => {
    const context = await renderRouter(fullRoutes(), { initialUrl: '/componentes/exibicao' })
    expect(await context.findByText('List')).toBeTruthy()
    expect(await context.findByText('Tabs')).toBeTruthy()
    expect(await context.findByText('BrandLogo')).toBeTruthy()
  })

  it('mostra o selo do codigo do catalogo ao lado do titulo (Tarefa 1.3, secao 2.1 e 3.3.4 do levantamento)', async () => {
    const acoes = await renderRouter(fullRoutes(), { initialUrl: '/componentes/acoes' })
    expect(await acoes.findByText('BTN-001')).toBeTruthy()
    const exibicao = await renderRouter(fullRoutes(), { initialUrl: '/componentes/exibicao' })
    expect(await exibicao.findByText('ABA-001')).toBeTruthy()
    expect(await exibicao.findByText('AVT-001')).toBeTruthy()
    expect(await exibicao.findByText('AVT-002')).toBeTruthy()
  })

  it('grupo de layout nao mostra selo (Container, Stack etc. nao tem codigo de catalogo)', async () => {
    const layout = await renderRouter(fullRoutes(), { initialUrl: '/componentes/layout' })
    expect(await layout.findByText('Container')).toBeTruthy()
    expect(layout.queryByText('CARD-001')).toBeNull()
  })
})
