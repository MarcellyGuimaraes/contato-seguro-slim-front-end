# Plano de implementação — Pessoa e Envolvimento

> **Para agentes:** use `superpowers:executing-plans` para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** implementar no `client/` o cadastro de pessoas, o vínculo de pessoas a relatos e a sinalização de anonimato, conforme o [plano de design](DESIGN_PLAN.md).

**Arquitetura:** dois domínios novos (`domain/person/` e `domain/involvement/`) seguindo o padrão já existente de Empresas e Relatos: `api/*.service.ts` (um arquivo por rota), `*.context.tsx` com render-prop e `components/`. Duas páginas novas (`/people` e `/records/:id`) e evolução da listagem de relatos.

**Stack:** React 19, Ant Design 5, TypeScript 5.8, Dayjs, React Router 7, Vite. Gerenciador: pnpm (dentro do container `frontend`).

**Spec:** [`docs/DESIGN_PLAN.md`](DESIGN_PLAN.md) — as decisões D1–D9 e riscos R1–R6 citados abaixo vêm de lá.

## Restrições globais

- **Nenhum arquivo de `server/` é criado, editado ou removido.**
- Todo texto visível ao usuário é em **português (PT-BR)**.
- Estilo do ESLint do projeto: 4 espaços, aspas simples, ponto e vírgula, imports ordenados nos grupos `react` → `antd` → pacotes → `@/` → relativos.
- Imports absolutos com `@domain/*` e `@pages/*`.
- Sem novas dependências: tudo com `antd`, `@ant-design/icons`, `dayjs` e `react-router`, já instalados.
- **Sem testes automatizados nesta etapa** (decisão da autora). A verificação de cada tarefa é feita com `lint:tsc`, `lint` e um roteiro manual no navegador; os cenários finais vão para `docs/MANUAL_TESTS.md`.
- Comandos rodam no container: `docker compose exec frontend <comando>`. Front em `https://localhost:5100`, API em `http://localhost:8080`.
- Datas da API (`birth_date`) são `YYYY-MM-DD` e são lidas/escritas com `dayjs(valor, 'YYYY-MM-DD')` / `.format('YYYY-MM-DD')`, nunca com `new Date()` (R6).
- Nos arquivos que importam o namespace `Record` de `@domain/record/record.type`, o utilitário `Record<K, V>` do TypeScript fica sombreado: use tipos mapeados (`{ [K in X]: V }`) em código novo.

## Review Focus

Entradas e falhas que o design implica, mas que nenhum passo exercita sozinho:

1. **CPF colado com pontuação** (`123.456.789-01`) no formulário deve ser aceito e enviado como `12345678901`. → Coberto na Tarefa 3, passo de verificação manual.
2. **Data de nascimento deslocada em um dia** por fuso horário ao abrir a edição. → Coberto na Tarefa 3 (editar pessoa e conferir que a data não mudou).
3. **Envolvimento com `person: null`** (pessoa excluída) não pode quebrar a tabela de envolvidos. → Coberto na Tarefa 6 (excluir pessoa vinculada e abrir o relato).
4. **URL de relato inexistente ou inválida** (`/records/9999`, `/records/abc`) deve mostrar estado vazio com volta, não tela branca. → Coberto na Tarefa 6.
5. **Falha parcial no carregamento do anonimato** na listagem: uma chamada com erro não pode travar a tabela nem as outras linhas. → Coberto na Tarefa 7 (célula mostra "—").

---

### Tarefa 0: Linha de base

**Arquivos:** nenhum.

- [ ] **Passo 1: Subir o ambiente e popular o banco** (README, seção Instalação, passos 3 a 7).
- [ ] **Passo 2: Registrar a linha de base da checagem de tipos e do lint**

Run: `docker compose exec frontend pnpm lint:tsc && docker compose exec frontend pnpm lint`
Expected: ambos terminam sem erros. Se já houver erros no código original, anotá-los aqui; eles não são responsabilidade das tarefas seguintes.

---

### Tarefa 1: Utilitários compartilhados (CPF e mensagens de erro)

**Arquivos:**
- Create: `client/src/domain/@shared/cpf.ts`
- Create: `client/src/domain/@shared/api-error-message.ts`

**Interfaces:**
- Produces:
  - `onlyDigits(value: string): string` — remove tudo que não é dígito.
  - `formatCpf(value: string): string` — formata progressivamente até `000.000.000-00` (aceita entrada parcial, usado na máscara do input).
  - `maskCpf(value: string): string` — `12345678901` → `***.456.789-**` (D5).
  - `translateApiError: MakeMessage` — `(response: Service.ServerException) => string | null`, compatível com o 3º argumento de `handleServiceError`.

- [ ] **Passo 1: Implementar `cpf.ts`** com as três funções acima.
- [ ] **Passo 2: Implementar `translateApiError`** com um mapa de `error.description` (texto exato da API) → mensagem PT-BR:

  | Descrição da API | Mensagem |
  | --- | --- |
  | `CPF already registered` | Este CPF já está cadastrado. |
  | `Invalid CPF format. Must be 11 digits` | O CPF deve ter 11 dígitos. |
  | `Invalid email format` | E-mail inválido. |
  | `Invalid birth date format` | Data de nascimento inválida. |
  | `Name is required` / `CPF is required` / `Email is required` / `Birth date is required` | Nome / CPF / E-mail / Data de nascimento é obrigatório. |
  | `Person not found` | Pessoa não encontrada. |
  | `Record not found` | Relato não encontrado. |
  | `Involvement not found` | Vínculo não encontrado. |
  | `Person already involved in this record` | Esta pessoa já está vinculada a este relato. |
  | `Person ID is required` / `Type is required` | Selecione a pessoa. / Selecione o tipo de envolvimento. |

  Descrição desconhecida com `statusCode >= 500` → "Não foi possível concluir a operação. Se a pessoa ou o vínculo já foi removido antes, o sistema pode estar impedindo o recadastro." (R2). Qualquer outra desconhecida → `null` (cai na descrição original, comportamento atual do helper).

  Antes de fechar o mapa, conferir as strings exatas em `server/src/Services/*.php` (leitura apenas), em especial a de relato inexistente.
- [ ] **Passo 3: Verificar**

Run: `docker compose exec frontend pnpm lint:tsc && docker compose exec frontend pnpm lint`
Expected: sem erros.
- [ ] **Passo 4: Commit** — `feat(shared): adiciona utilitários de CPF e tradução de erros da API`

---

### Tarefa 2: Domínio Pessoa — tipos e serviços

**Arquivos:**
- Create: `client/src/domain/person/person.type.ts`
- Create: `client/src/domain/person/api/list-people.service.ts`
- Create: `client/src/domain/person/api/create-person.service.ts`
- Create: `client/src/domain/person/api/update-person.service.ts`
- Create: `client/src/domain/person/api/delete-person.service.ts`

**Interfaces:**
- Produces:
  - `namespace Person { type Model = { id: number; name: string; cpf: string; email: string; birth_date: string; created_at: string; updated_at: string | null; deleted_at: string | null } }`
  - `type Person.Body = Pick<Person.Model, 'name' | 'cpf' | 'email' | 'birth_date'>`
  - `listPeople(): Promise<DefaultResponse<{ people: Person.Model[] }> | ExceptionResponse>` — `GET /people`
  - `createPerson(body: Person.Body)` → `{ person: Person.Model }` — `POST /people`
  - `updatePerson(id: Person.Model['id'], body: Person.Body)` → `{ person: Person.Model }` — `PUT /people/{id}`
  - `deletePerson(id: Person.Model['id'])` → sem `data` — `DELETE /people/{id}`

- [ ] **Passo 1: Criar o tipo e os quatro serviços**, copiando a forma de `domain/company/api/*` (JSDoc `@service/@route/@http` incluso). `GET /people/{id}` não é usado por nenhuma tela e fica de fora (YAGNI).
- [ ] **Passo 2: Verificar** — `pnpm lint:tsc && pnpm lint` sem erros.
- [ ] **Passo 3: Commit** — `feat(person): adiciona tipos e serviços de pessoa`

---

### Tarefa 3: Tela de Pessoas (`/people`)

**Arquivos:**
- Create: `client/src/domain/person/People.context.tsx`
- Create: `client/src/domain/person/components/PersonFields.tsx`
- Create: `client/src/domain/person/components/CreatePersonModal.tsx`
- Create: `client/src/domain/person/components/EditPersonModal.tsx`
- Create: `client/src/domain/person/components/PeopleActionsCell.tsx`
- Create: `client/src/pages/People.page.tsx`
- Modify: `client/src/router.tsx` (rota `/people`)
- Modify: `client/src/MainLayout.tsx` (item "Pessoas", ícone `TeamOutlined`, entre Empresas e Relatos)

**Interfaces:**
- Consumes: Tarefa 1 (`formatCpf`, `maskCpf`, `onlyDigits`, `translateApiError`), Tarefa 2 (serviços e `Person.*`).
- Produces:
  - `PeopleContextProvider` / `usePeopleContext()` com o mesmo `Value` de `Companies.context.tsx`, trocando `company*` por `person*` e `fetchCompanies` por `fetchPeople`.
  - `CreatePersonModal({ onCreated?: (person: Person.Model) => void })` — usado também na Tarefa 6.

- [ ] **Passo 1: `People.context.tsx`** — cópia do padrão de `Companies.context.tsx`.
- [ ] **Passo 2: `PersonFields.tsx`** com `Values = Person.Body`:
  - `name`: obrigatório.
  - `cpf`: obrigatório e `pattern: /^\d{11}$/` ("O CPF deve ter 11 dígitos."). O form guarda **só dígitos** e o input mostra formatado: `normalize={onlyDigits}` + `getValueProps={value => ({ value: formatCpf(value ?? '') })}`, `maxLength={14}`.
  - `email`: obrigatório + `type: 'email'`.
  - `birth_date`: obrigatório, `DatePicker` com `format="DD/MM/YYYY"`, `disabledDate={d => d.isAfter(dayjs(), 'day')}`, `style={{ width: '100%' }}`. O form guarda a string `YYYY-MM-DD`: `getValueProps={v => ({ value: v ? dayjs(v, 'YYYY-MM-DD') : undefined })}` + `normalize={(d: Dayjs | null) => d?.format('YYYY-MM-DD')}`.
- [ ] **Passo 3: `CreatePersonModal` e `EditPersonModal`** — padrão dos modais de empresa, passando `translateApiError` ao `handleServiceError`. O de criação, após sucesso, chama `fetchPeople()` e depois `onCreated?.(response.data.person)`.
- [ ] **Passo 4: `PeopleActionsCell`** — padrão de `CompaniesActionsCell`; descrição do Popconfirm: "Tem certeza que deseja excluir esta pessoa? Ela continuará aparecendo nos relatos aos quais está vinculada." (R4).
- [ ] **Passo 5: `People.page.tsx`** — título "Pessoas", botão "Cadastrar", `Input.Search` "Buscar por nome ou CPF" (`allowClear`) e tabela com colunas ID (`#id`), Nome, CPF (`maskCpf`), E-mail, Nascimento (`DD/MM/AAAA`) e ações. Filtro local: nome contém o termo (sem diferenciar maiúsculas) **ou** `cpf` contém `onlyDigits(termo)` quando houver dígitos.
- [ ] **Passo 6: Rota e menu.**
- [ ] **Passo 7: Verificar tipos e lint** — `pnpm lint:tsc && pnpm lint` sem erros.
- [ ] **Passo 8: Verificação manual** em `https://localhost:5100/people`:
  - Cadastrar pessoa → aparece na tabela com CPF mascarado.
  - Cadastrar colando `123.456.789-01` → enviado só com dígitos (aba Network) (Review Focus 1).
  - CPF repetido → notificação "Este CPF já está cadastrado.".
  - Campos vazios → mensagens do formulário, nenhuma chamada à API.
  - Editar → a data de nascimento abre igual à listada e continua igual após salvar (Review Focus 2).
  - Excluir → some da lista.
  - Busca por parte do nome e por parte do CPF.
- [ ] **Passo 9: Commit** — `feat(person): adiciona tela de pessoas com cadastro, edição, exclusão e busca`

---

### Tarefa 4: Domínio Envolvimento — tipos, rótulos e serviços

**Arquivos:**
- Create: `client/src/domain/involvement/involvement.type.ts`
- Create: `client/src/domain/involvement/involvement.constants.ts`
- Create: `client/src/domain/involvement/api/list-involvements.service.ts`
- Create: `client/src/domain/involvement/api/create-involvement.service.ts`
- Create: `client/src/domain/involvement/api/delete-involvement.service.ts`

**Interfaces:**
- Consumes: `Person.Model` (Tarefa 2), `Record.Model['id']`.
- Produces:
  - `namespace Involvement { type Type = 'whistleblower' | 'witness' | 'victim' | 'denounced'; type Model = { id: number; type: Type; record_id: number; person_id: number; created_at: string; updated_at: string | null; deleted_at: string | null; person: Person.Model | null } }` — `person` anulável por R3.
  - `INVOLVEMENT_TYPE_LABELS: { [K in Involvement.Type]: string }` — Relatante, Testemunha, Vítima, Denunciado.
  - `INVOLVEMENT_TYPE_COLORS: { [K in Involvement.Type]: string }` — cores de `Tag` do antd: `blue`, `green`, `orange`, `red`, nessa ordem.
  - `INVOLVEMENT_TYPE_OPTIONS: { label: string; value: Involvement.Type }[]`.
  - `listInvolvements(recordId)` → `{ involvements: Involvement.Model[]; is_anonymous: boolean }` — `GET /records/{recordId}/involvements`
  - `createInvolvement(recordId, body: { person_id: number; type: Involvement.Type })` → `{ involvement: Involvement.Model }` — `POST`
  - `deleteInvolvement(recordId, id)` → sem `data` — `DELETE /records/{recordId}/involvements/{id}`

- [ ] **Passo 1: Criar tipos, constantes e serviços.**
- [ ] **Passo 2: Verificar** — `pnpm lint:tsc && pnpm lint` sem erros.
- [ ] **Passo 3: Commit** — `feat(involvement): adiciona tipos, rótulos e serviços de envolvimento`

---

### Tarefa 5: Tag de anonimato

**Arquivos:**
- Create: `client/src/domain/involvement/components/AnonymityTag.tsx`

**Interfaces:**
- Produces:
  - `type AnonymityStatus = 'loading' | 'anonymous' | 'identified' | 'error'` (exportado do mesmo arquivo).
  - `AnonymityTag({ status }: { status: AnonymityStatus })` — `loading`: `Spin size="small"`; `anonymous`: `Tag` laranja com `EyeInvisibleOutlined` "Anônimo"; `identified`: `Tag` azul com `UserOutlined` "Identificado"; `error`: texto "—" com `title="Não foi possível verificar"`.

- [ ] **Passo 1: Implementar o componente.**
- [ ] **Passo 2: Verificar** — `pnpm lint:tsc && pnpm lint` sem erros.
- [ ] **Passo 3: Commit** junto com a Tarefa 6 (o componente só é visível a partir dela).

---

### Tarefa 6: Detalhe do relato (`/records/:id`)

**Arquivos:**
- Create: `client/src/domain/involvement/use-record-involvements.ts`
- Create: `client/src/domain/involvement/components/InvolvementsTable.tsx`
- Create: `client/src/domain/involvement/components/CreateInvolvementModal.tsx`
- Create: `client/src/pages/RecordDetail.page.tsx`
- Modify: `client/src/router.tsx` (rota `/records/:id`)

**Interfaces:**
- Consumes: Tarefas 1, 3 (`PeopleContextProvider`, `usePeopleContext`, `CreatePersonModal`), 4 e 5; `findRecord` e `CompaniesContextProvider` existentes.
- Produces:
  - `useRecordInvolvements(recordId: number): { involvements: Involvement.Model[]; isAnonymous: boolean | null; isLoading: boolean; fetchInvolvements: () => Promise<void> }` — busca ao montar; em erro chama `handleServiceError(app, response, translateApiError)`.
  - `InvolvementsTable({ involvements, recordId, isLoading, onChange: () => void })`.
  - `CreateInvolvementModal({ recordId, involvedPersonIds: number[], onClose: () => void, onCreated: () => void })`.

- [ ] **Passo 1: `use-record-involvements.ts`.**
- [ ] **Passo 2: `InvolvementsTable`** (usa `@domain/@shared/Table`): colunas Nome, CPF (`formatCpf`, **completo** — D5), E-mail, Tipo (`Tag` com rótulo e cor da Tarefa 4) e ação remover (Popconfirm "Remover vínculo" / "Tem certeza que deseja remover esta pessoa do relato?" → `deleteInvolvement` → `onChange()`). Linha com `person === null`: Nome "Pessoa removida" em `Typography.Text type="secondary"` e "—" nas colunas de pessoa (R3).
- [ ] **Passo 3: `CreateInvolvementModal`** — `Form` com:
  - `person_id`: `Select` obrigatório, `showSearch`, opções de `usePeopleContext().people` com `label` `"<nome> — <formatCpf(cpf)>"`; pessoas em `involvedPersonIds` ficam `disabled` com sufixo " (já vinculada)" (D4). `filterOption` compara o termo com o label em minúsculas e também `onlyDigits(termo)` com o CPF.
  - Abaixo do select: `Button type="link"` "Cadastrar nova pessoa" → `setIsCreateModalVisible(true)` do contexto de pessoas; renderiza `<Show when={isCreateModalVisible}><CreatePersonModal onCreated={p => form.setFieldValue('person_id', p.id)} /></Show>`.
  - `type`: `Select` obrigatório com `INVOLVEMENT_TYPE_OPTIONS`.
  - Envio: `createInvolvement` → em erro `handleServiceError(app, response, translateApiError)`; em sucesso `onCreated()` e `onClose()`.
- [ ] **Passo 4: `RecordDetail.page.tsx`**:
  - Lê `id` com `useParams`; se `Number(id)` não for inteiro positivo, já renderiza o estado de não encontrado.
  - Busca o relato com `findRecord`. Resposta 404 (ou `id` inválido) → `Result status="404"` "Relato não encontrado" com botão "Voltar para relatos" (Review Focus 4). Outros erros → `handleServiceError`.
  - Envolve o conteúdo em `CompaniesContextProvider` (nome da empresa via `companies.find`) e `PeopleContextProvider` (select do modal).
  - Cabeçalho: link "← Relatos", título `#<id> <title>`, `AnonymityTag` (status derivado de `isAnonymous`: `null` → `loading`), `Descriptions` com Status (mesmos rótulos de `Records.page.tsx`), Empresa, Criado em (`DD/MM/YYYY HH:mm`) e Descrição.
  - Seção "Envolvidos" com botão "Vincular pessoa" e `InvolvementsTable`. Após criar ou remover, `fetchInvolvements()` (atualiza lista **e** selo — D2).
- [ ] **Passo 5: Rota** `/records/:id` → `<RecordDetail />`. O menu continua marcando "Relatos" (o `MainLayout` usa o primeiro segmento da URL).
- [ ] **Passo 6: Verificar tipos e lint** — `pnpm lint:tsc && pnpm lint` sem erros.
- [ ] **Passo 7: Verificação manual** (acessar `https://localhost:5100/records/1` diretamente, pois o link na listagem chega na Tarefa 7):
  - Relato com relatante → "Identificado"; remover o relatante → muda para "Anônimo" sem recarregar a página.
  - Vincular pessoa como Testemunha → aparece na tabela com CPF completo.
  - Pessoa já vinculada aparece desabilitada no select.
  - "Cadastrar nova pessoa" no modal → cadastrar → pessoa volta já selecionada.
  - Enviar o modal vazio → mensagens do formulário.
  - `/records/9999` e `/records/abc` → tela de não encontrado (Review Focus 4).
  - Excluir em `/people` uma pessoa vinculada e voltar ao relato → linha "Pessoa removida", sem erro (Review Focus 3, R3/R4). Anotar se o selo continua "Identificado".
  - Remover um vínculo e vincular a mesma pessoa de novo → anotar o status retornado (R2).
- [ ] **Passo 8: Commit** — `feat(involvement): adiciona detalhe do relato com envolvidos e anonimato`

---

### Tarefa 7: Listagem de relatos — identificação, filtros e link

**Arquivos:**
- Create: `client/src/domain/involvement/use-anonymity-by-record.ts`
- Modify: `client/src/pages/Records.page.tsx`

**Interfaces:**
- Consumes: `listInvolvements` (Tarefa 4), `AnonymityStatus` e `AnonymityTag` (Tarefa 5), `useCompaniesContext` existente.
- Produces: `useAnonymityByRecord(records: Record.Model[]): Map<Record.Model['id'], AnonymityStatus>` — ao mudar `records`, marca todos como `loading` e dispara `listInvolvements` de todos em paralelo (`Promise.all`); cada resultado atualiza só a sua entrada (`anonymous` / `identified` / `error`). Não notifica erro por linha (evita uma notificação por relato); a célula mostra "—" (Review Focus 5).

- [ ] **Passo 1: Implementar o hook.**
- [ ] **Passo 2: Evoluir `Records.page.tsx`**:
  - Colunas passam para dentro do componente (precisam do mapa de anonimato).
  - Título vira `<Link to={`/records/${id}`}>`.
  - Nova coluna "Identificação" com `AnonymityTag`.
  - Linha de filtros acima da tabela: Empresa (`Select` com busca, `allowClear`), Status (`Select`, `allowClear`) e Identificação (`Select` "Anônimo" / "Identificado", `allowClear`). Filtro local com `useMemo` (D9). O filtro de identificação considera só linhas já carregadas como `anonymous`/`identified`.
  - Para ler as empresas, a render-prop de `CompaniesContextProvider` passa a usar `companies` (hoje é `() => ...`).
- [ ] **Passo 3: Verificar tipos e lint** — `pnpm lint:tsc && pnpm lint` sem erros.
- [ ] **Passo 4: Verificação manual** em `/records`:
  - Coluna mostra carregamento e depois Anônimo/Identificado coerente com o detalhe de cada relato.
  - Cada filtro sozinho e combinado; limpar volta à lista completa.
  - Clicar no título abre o detalhe; editar/excluir continuam funcionando.
  - Com a API parada (`docker compose stop nginx`) e a página já aberta, recarregar os dados → tabela não quebra. Religar com `docker compose start nginx`.
- [ ] **Passo 5: Commit** — `feat(record): adiciona identificação, filtros e link para detalhe na listagem`

---

### Tarefa 8: Evidências dos testes manuais

**Arquivos:**
- Create: `docs/MANUAL_TESTS.md`
- Create: `docs/evidencias/` (capturas de tela, ao menos uma por épico)

- [ ] **Passo 1: Rodar a checagem final** — `pnpm lint:tsc && pnpm lint && pnpm build` sem erros.
- [ ] **Passo 2: Executar e documentar os cenários**, cada um com: o que foi testado, passos, resultado esperado e resultado obtido (formato do README). Lista mínima:
  - **Épico 1:** cadastrar pessoa e vê-la na listagem; CPF duplicado; campos obrigatórios ausentes; CPF com formato inválido; editar; excluir; busca.
  - **Épico 2:** vincular pessoa com tipo e ver o vínculo; relato sem relatante aparece como anônimo (detalhe e listagem); adicionar/remover relatante muda o selo; pessoa duplicada no mesmo relato (bloqueada no select; 409 se forçado via Insomnia); relato inexistente; filtros de identificação.
  - **Riscos:** resultado real de R2 (revincular / recadastrar CPF excluído), R3 e R4 — confirmado ou descartado, atualizando a tabela de riscos do `DESIGN_PLAN.md`.
- [ ] **Passo 3: Commit** — `docs: adiciona evidências dos testes manuais`
