# Plano de design — Pessoa e Envolvimento

Este documento registra o entendimento do [Mini PRD](../MINI_PRD.md), o que será construído no front-end, as decisões tomadas e os riscos identificados.

Toda a implementação acontece em `client/`. Nenhum arquivo de `server/` será alterado.

---

## 1. Entendimento do PRD

O usuário principal é o **membro de comitê**, que recebe, registra e investiga relatos. Hoje o sistema não registra quem está envolvido em cada relato, e o PRD propõe dois conceitos complementares:

### Épico 1 — Pessoa

- Cadastro central de pessoas, **do sistema** (não pertence a uma empresa).
- Campos obrigatórios: nome completo, CPF, e-mail e data de nascimento.
- **CPF único** no sistema.
- Uma mesma pessoa pode estar em vários relatos, com papéis diferentes.

### Épico 2 — Envolvimento

- Vínculo entre pessoa e relato com um **tipo**:

  | Valor da API    | Rótulo na tela |
  | --------------- | -------------- |
  | `whistleblower` | Relatante      |
  | `witness`       | Testemunha     |
  | `victim`        | Vítima         |
  | `denounced`     | Denunciado     |

- Uma pessoa aparece **no máximo uma vez por relato**.
- Um relato **sem relatante é anônimo**. O anonimato é derivado dos envolvimentos, não é um campo do relato. O back-end já calcula isso (`is_anonymous`), e o front apenas exibe, sem recalcular.

### O que a API oferece

| Rota | Uso |
| --- | --- |
| `GET/POST /people`, `GET/PUT/DELETE /people/{id}` | CRUD de pessoas. CPF duplicado → 409. CPF fora do formato de 11 dígitos → 422. |
| `GET /records/{id}/involvements` | Lista os envolvidos (com `person` aninhado) e `is_anonymous`. |
| `POST /records/{id}/involvements` | Cria vínculo `{ person_id, type }`. Duplicata → 409. Relato/pessoa inexistente → 404. |
| `DELETE /records/{id}/involvements/{id}` | Remove vínculo. |
| `GET /records?company_id=` | Filtro de relatos por empresa (já existente). |

---

## 2. O que será construído

### 2.1 Tela de Pessoas — `/people`

Novo item **"Pessoas"** no menu lateral.

- **Listagem** em tabela: ID, nome, CPF **mascarado** (`***.456.789-**`), e-mail, data de nascimento (`DD/MM/AAAA`) e ações.
- **Busca** por nome ou CPF (filtro local, sem chamada extra).
- **Cadastrar / Editar** em modal, seguindo o padrão de Empresas:
  - Nome e e-mail com validação de obrigatoriedade e formato.
  - CPF com máscara `000.000.000-00` no campo, enviado à API **somente com dígitos**.
  - Data de nascimento com `DatePicker` (formato `DD/MM/AAAA`, sem datas futuras), enviada como `YYYY-MM-DD`.
- **Excluir** com confirmação. O texto avisa que a pessoa pode estar vinculada a relatos.

### 2.2 Listagem de Relatos — `/records` (evolução)

- Nova coluna **"Identificação"** com tag **Anônimo** / **Identificado**.
  - Como `GET /records` não retorna `is_anonymous`, após carregar os relatos o front busca `/records/{id}/involvements` de cada relato **em paralelo** e monta um mapa `recordId → is_anonymous`.
  - Enquanto carrega, a célula mostra um indicador de carregamento. Se a chamada falhar, mostra "—" em vez de quebrar a tabela.
- **Filtros**: empresa, status e identificação (anônimo/identificado).
- O título do relato vira **link** para a página de detalhe. As ações de editar e excluir continuam como estão.

### 2.3 Detalhe do Relato — `/records/:id` (nova rota)

```
┌──────────────────────────────────────────────┐
│ ← Relatos                                    │
│ #12 Título do relato           [Anônimo]     │
│ Status · Empresa · Criado em                 │
│ Descrição...                                 │
├──────────────────────────────────────────────┤
│ Envolvidos                     [+ Vincular]  │
│ Nome    CPF              E-mail   Tipo   🗑   │
│ Ana     123.456.789-01   ...      Vítima 🗑   │
└──────────────────────────────────────────────┘
```

- **Cabeçalho**: dados do relato (`GET /records/{id}`) e selo de anonimato em destaque, atendendo à história "ver claramente se um relato é anônimo".
- **Tabela de envolvidos**: nome, CPF **completo e formatado**, e-mail, tipo (tag colorida por tipo) e ação de remover com confirmação.
- **Modal "Vincular pessoa"**:
  - **Select de pessoa** com busca por nome ou CPF. Pessoas já vinculadas ao relato aparecem **desabilitadas**, com a indicação "já vinculada".
  - Botão **"Cadastrar nova pessoa"**, que abre o modal de pessoa sem sair do fluxo. Após o cadastro, a nova pessoa já vem selecionada.
  - **Select de tipo** com os quatro rótulos em português.
- Após vincular ou remover, a lista e o selo de anonimato são recarregados a partir da API.
- Relato inexistente (404) mostra um estado vazio com link de volta para a listagem.

---

## 3. Decisões

| # | Decisão | Motivo |
| - | ------- | ------ |
| D1 | Envolvidos ficam numa **página de detalhe** (`/records/:id`), não em modal ou drawer. | Mais espaço para dados do relato + lista + ações, e a URL é compartilhável entre membros do comitê. |
| D2 | O anonimato é **sempre lido da API** (`is_anonymous`), nunca calculado no front. | O PRD diz que a responsabilidade é do envolvimento. Manter uma única fonte de verdade evita divergência. |
| D3 | **Não há edição do tipo de envolvimento.** Para trocar, o usuário remove e vincula de novo. | A API não tem rota de atualização. Simular com DELETE + POST pode perder o vínculo se o POST falhar (ver R2). |
| D4 | No vínculo, pessoas já vinculadas ficam **desabilitadas** no select. | Previne o 409 antes do envio. O tratamento do 409 continua existindo como segunda barreira. |
| D5 | **CPF mascarado nas listagens gerais** e **completo no detalhe do relato e nos formulários**. | CPF é dado pessoal sensível (LGPD) num contexto de denúncia. No detalhe, o membro do comitê está investigando o caso e precisa da identificação completa. |
| D6 | Mensagens de erro da API (em inglês) são **traduzidas para PT-BR** via `makeMessage` do `handleServiceError`. | Ex.: `CPF already registered` → "Este CPF já está cadastrado." Mensagens desconhecidas usam um texto genérico em português. |
| D7 | Validação no front espelha a do back (obrigatoriedade, 11 dígitos, e-mail válido, data válida). | Feedback imediato no formulário. O back continua sendo a validação final. |
| D8 | O código segue a estrutura existente: `domain/person/` e `domain/involvement/`, com `api/*.service.ts`, `*.context.tsx` e `components/`. | Consistência com Empresas e Relatos, o que facilita a leitura por quem já conhece o projeto. |
| D9 | Busca e filtros são feitos **no front**, sobre os dados já carregados. | A API não oferece busca nem paginação (exceto `company_id`). O volume esperado nesta fase é pequeno. |

---

## 4. Riscos

Riscos identificados lendo o código do back-end. **Ainda não foram verificados na prática.** Serão confirmados ou descartados durante os testes manuais.

| # | Risco | Impacto | Mitigação no front |
| - | ----- | ------- | ------------------ |
| R1 | **N chamadas para o anonimato na listagem**: uma chamada a `/involvements` por relato. | Lentidão com muitos relatos. | Chamadas em paralelo, carregamento por célula e falha isolada por linha. Aceitável no volume atual, registrado como dívida para uma futura rota que retorne `is_anonymous` na listagem. |
| R2 | **Soft delete + índice único no banco.** Pessoas e envolvimentos usam soft delete, mas existem índices únicos em `people.cpf` e `involvements(record_id, person_id)`. A checagem de duplicidade do back ignora registros excluídos, então o banco pode rejeitar a inserção. | Revincular uma pessoa removida de um relato, ou recadastrar o CPF de uma pessoa excluída, pode retornar **500** em vez de 409. | Tratar 500 nesses fluxos com uma mensagem clara ("Não foi possível concluir. Essa pessoa/CPF pode ter sido removida anteriormente."). Documentar nas evidências. |
| R3 | **Envolvimento de pessoa excluída** pode vir com `person: null` no `GET /involvements`. | Tabela de envolvidos quebrar ao acessar `person.name`. | Tipagem `person: Person.Model \| null` e linha exibida como "Pessoa removida". |
| R4 | **Excluir uma pessoa vinculada a relatos** não é bloqueado pela API, e os vínculos continuam contando (inclusive como relatante). | Um relato pode continuar "Identificado" por causa de um relatante excluído. | Aviso explícito na confirmação de exclusão. Registrar o comportamento observado nas evidências. |
| R5 | **CPF validado só por formato** (11 dígitos) no back. | CPFs inválidos (ex.: `11111111111`) são aceitos. | Fora do escopo desta entrega. Pode virar melhoria futura com validação de dígito verificador no front. |
| R6 | **Fuso horário na data de nascimento.** Converter `YYYY-MM-DD` com `Date` pode deslocar um dia. | Data exibida errada. | Usar `dayjs` com formato explícito, sem conversão de fuso. |

---

## 5. Fora do escopo

- Qualquer alteração em `server/`.
- Edição do tipo de envolvimento (ver D3).
- Validação de dígito verificador do CPF (ver R5).
- Testes automatizados nesta etapa. A validação será por **testes manuais** documentados em `docs/MANUAL_TESTS.md`.
- Itens que o PRD declara como não objetivos: fluxo completo de investigação, autenticação, notificações e app móvel.

---

## 6. Como os cenários do PRD serão atendidos

| Cenário do PRD | Onde é atendido |
| --- | --- |
| Cadastrar pessoa e vê-la na listagem | Tela `/people` → modal Cadastrar → tabela recarregada |
| CPF duplicado é validado | 409 traduzido para "Este CPF já está cadastrado." |
| Vincular pessoa a relato com tipo e verificar o vínculo | `/records/:id` → modal Vincular → tabela de envolvidos |
| Relato sem relatante é identificado como anônimo | Selo no detalhe + coluna "Identificação" na listagem |
| Cenário de falha (dado ausente / vínculo inválido) | Validação de formulário + tratamento de 409/404/422 com mensagens em PT-BR |
