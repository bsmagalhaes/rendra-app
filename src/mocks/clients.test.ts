import { isValidCnpj } from '../lib/validators';
import { porSegmento, receitaMensal } from './charts';
import { activityOf, clients, contractsOf, filterClients, findClient, monthly, resumoPeriodo, segmentos, statusTone } from './clients';

describe('mocks de clientes', () => {
  it('são 48, com ids únicos a partir de 1000 e nomes únicos', () => {
    expect(clients).toHaveLength(48);
    expect(clients[0]!.id).toBe(1000);
    expect(new Set(clients.map((c) => c.id)).size).toBe(48);
    expect(new Set(clients.map((c) => c.nome)).size).toBe(48);
  });

  it('são determinísticos e sem dado real (e-mails de exemplo)', () => {
    for (const c of clients) expect(c.email).toMatch(/@exemplo\.com\.br$/);
  });

  it('cada situação tem ao menos 5 clientes e um tom de badge', () => {
    for (const situacao of ['Ativo', 'Inativo', 'Em análise'] as const) {
      expect(clients.filter((c) => c.situacao === situacao).length).toBeGreaterThanOrEqual(5);
      expect(statusTone[situacao]).toBeDefined();
    }
  });

  it('filtra por busca sem diferenciar maiúsculas e pagina de 10 em 10', () => {
    const alvo = clients[3]!;
    expect(filterClients({ busca: alvo.nome.toUpperCase() }).total).toBe(1);
    const p5 = filterClients({ pagina: 5, porPagina: 10 });
    expect(p5.itens).toHaveLength(8);
    expect(p5.total).toBe(48);
  });

  it('acha por id e devolve undefined para id inexistente', () => {
    expect(findClient(1000)?.nome).toBe(clients[0]!.nome);
    expect(findClient(9999)).toBeUndefined();
  });

  it('o resumo de 12 meses difere do de 6 e os contratos são do cliente', () => {
    expect(resumoPeriodo(12).receita).toBeGreaterThan(resumoPeriodo(6).receita);
    expect(resumoPeriodo(12).novosClientes).toBeGreaterThan(resumoPeriodo(6).novosClientes);
    expect(contractsOf(1000).length).toBeGreaterThan(0);
    expect(contractsOf(9999)).toEqual([]);
  });

  it('filtra sobre a carteira informada, com o total e a página dela', () => {
    const base = clients.slice(2);
    const r = filterClients({ base });
    expect(r.total).toBe(46);
    expect(r.itens[0]!.id).toBe(clients[2]!.id);
    expect(filterClients({ busca: clients[0]!.nome, base }).total).toBe(0);
  });

  it('cada cliente tem atividade recente com datas no formato DD/MM/AAAA', () => {
    const eventos = activityOf(1000);
    expect(eventos.length).toBeGreaterThan(2);
    for (const e of eventos) expect(e.data).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(activityOf(9999)).toEqual([]);
  });

  it('a variação da receita compara com o período anterior quando ele existe', () => {
    const variacao = resumoPeriodo(6).variacaoReceita;
    expect(variacao).toBeGreaterThan(0);
    expect(resumoPeriodo(12).variacaoReceita).toBeUndefined();
  });

  it('os CNPJs fictícios têm dígitos verificadores válidos e são únicos', () => {
    for (const c of clients) expect(isValidCnpj(c.cnpj)).toBe(true);
    expect(new Set(clients.map((c) => c.cnpj)).size).toBe(48);
  });
});

describe('receita dos indicadores e dos gráficos (P4)', () => {
  it('a receita de setembro/2026 é a mesma nos indicadores e no gráfico', () => {
    expect(monthly.at(-1)!.mes).toBe('Set/2026');
    expect(receitaMensal.at(-1)!.mes).toBe('Set');
    expect(monthly.at(-1)!.receita).toBe(receitaMensal.at(-1)!.receita);
  });

  it('os segmentos do gráfico são todos segmentos da carteira', () => {
    for (const s of porSegmento) expect(segmentos).toContain(s.segmento);
  });
});
