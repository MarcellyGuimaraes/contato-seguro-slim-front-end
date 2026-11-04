# Plano de implementação — Cadastro de relato com envolvidos

> **Para agentes:** use `superpowers:executing-plans` para executar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** cadastrar relato e envolvidos num único modal, com status inicial fixo e toggle "Anônimo".

**Arquitetura:** a lógica sem tela fica em dois módulos puros e testados com Vitest: regras das linhas de envolvidos (`involvement-draft.ts`) e o envio em sequência relato → vínculos (`create-record-with-involvements.ts`). O select de pessoa é extraído do `CreateInvolvementModal` para ser reaproveitado. O `CreateRecordModal` passa a montar as duas partes com `Form.List`.

**Stack:** React 19, Ant Design 5, TypeScript 5.8, React Router 7, Vitest 4 (ambiente `node`). pnpm dentro do container `frontend`.

**Spec:** [`docs/superpowers/specs/2026-11-04-relato-com-envolvidos-design.md`](../specs/2026-11-04-relato-com-envolvidos-design.md)

## Restrições globais

- **Nenhum arquivo de** `server/` **é alterado.** `docs/DESIGN_PLAN.md` e `docs/IMPLEMENTATION_PLAN.md` também não.
- **Sem comentários no código.**
- Todo texto visível em PT-BR.
- Estilo do ESLint do projeto (4 espaços, aspas simples, ponto e vírgula, imports ordenados); imports absolutos `@domain/*` / `@pages/*`.
- Sem novas dependências.
- Status enviado no cadastro: `'awaiting_investigation'`, sempre.
- O modal de edição de relato e o fluxo de vínculo no detalhe do relato continuam funcionando como hoje.
- Comandos rodam a partir da raiz do repositório: `docker compose exec frontend <comando>`.
- **Ao fim de cada tarefa, parar**: a autora faz o commit na `main` antes da próxima.
- Nos arquivos que importam o namespace `Record` de `@domain/record/record.type`, o utilitário `Record<K, V>` do TypeScript fica sombreado: use tipos mapeados.

## Review Focus

1. **Ligar o toggle com relatante(s) escolhido(s)**: as linhas de relatante somem, as demais ficam intactas. Desligar de novo não traz nada de volta, e o envio volta a exigir relatante. → Teste na Tarefa 1 (`removeWhistleblowers`) e roteiro manual na Tarefa 4.
2. **Relato anônimo sem nenhum envolvido**: cria só o relato, sem nenhuma chamada de vínculo. → Teste na Tarefa 2 (lista vazia) e roteiro manual na Tarefa 4.
3. **Linha incompleta** (pessoa sem tipo ou tipo sem pessoa): o envio é bloqueado na própria linha. → Roteiro manual na Tarefa 4.
4. **Pessoa removida de uma linha** volta a ficar disponível nas outras. → Teste na Tarefa 1 (`getSelectedPersonIds`) e roteiro manual na Tarefa 4.
5. **Falha ao criar o relato**: nenhum vínculo é enviado, o modal continua aberto e os dados preenchidos são mantidos. → Teste na Tarefa 2 e roteiro manual na Tarefa 4 (API parada).

---

### Tarefa 0: Linha de base

**Arquivos:** nenhum.

- [ ] **Passo 1: Registrar a linha de base**

Run: `docker compose exec frontend pnpm lint:tsc && docker compose exec frontend pnpm lint && docker compose exec frontend pnpm test`
Expected: tudo passa. Se algo já falhar no código atual, anotar aqui; não é responsabilidade das tarefas seguintes.

---

### Tarefa 1: Regras das linhas de envolvidos

**Arquivos:**
- Create: `client/src/domain/involvement/involvement-draft.ts`
- Test: `client/src/domain/involvement/involvement-draft.test.ts`

**Interfaces:**
- Consumes: `INVOLVEMENT_TYPE_OPTIONS` (`involvement.constants.ts`), `Involvement.Type`, `Person.Model`.
- Produces:
  - `type InvolvementDraft = { person_id?: Person.Model['id']; type?: Involvement.Type }`
  - `getTypeOptions(isAnonymous: boolean): { label: string; value: Involvement.Type }[]`
  - `hasWhistleblower(drafts: InvolvementDraft[]): boolean`
  - `removeWhistleblowers(drafts: InvolvementDraft[]): InvolvementDraft[]`
  - `getSelectedPersonIds(drafts: InvolvementDraft[]): Person.Model['id'][]`

Os campos do draft são opcionais porque o `Form.List` cria linhas vazias.

- [ ] **Passo 1: Escrever os testes**

```ts
describe('getTypeOptions', () => {
    it('returns all four types when not anonymous', () => {
        expect(getTypeOptions(false).map(o => o.value))
            .toEqual(['whistleblower', 'witness', 'victim', 'denounced']);
    });

    it('omits whistleblower when anonymous', () => {
        expect(getTypeOptions(true).map(o => o.value))
            .toEqual(['witness', 'victim', 'denounced']);
    });
});

describe('hasWhistleblower', () => {
    it('is false for an empty list', () => expect(hasWhistleblower([])).toBe(false));
    it('is false when no row is whistleblower', () =>
        expect(hasWhistleblower([{ person_id: 1, type: 'witness' }, {}])).toBe(false));
    it('is true when any row is whistleblower', () =>
        expect(hasWhistleblower([{ person_id: 1, type: 'witness' }, { person_id: 2, type: 'whistleblower' }])).toBe(true));
});

describe('removeWhistleblowers', () => {
    it('removes every whistleblower row and keeps the others in order', () => {
        const drafts: InvolvementDraft[] = [
            { person_id: 1, type: 'whistleblower' },
            { person_id: 2, type: 'witness' },
            { person_id: 3, type: 'whistleblower' },
            { person_id: 4 },
            {},
        ];

        expect(removeWhistleblowers(drafts)).toEqual([{ person_id: 2, type: 'witness' }, { person_id: 4 }, {}]);
    });
});

describe('getSelectedPersonIds', () => {
    it('returns only filled person ids', () =>
        expect(getSelectedPersonIds([{ person_id: 1 }, {}, { type: 'victim' }, { person_id: 3, type: 'witness' }])).toEqual([1, 3]));
});
```

- [ ] **Passo 2: Rodar e ver falhar**

Run: `docker compose exec frontend pnpm test src/domain/involvement/involvement-draft.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Passo 3: Implementar** as quatro funções e o tipo em `involvement-draft.ts`. `getTypeOptions` filtra `INVOLVEMENT_TYPE_OPTIONS`, sem duplicar rótulos.

- [ ] **Passo 4: Rodar e ver passar**

Run: `docker compose exec frontend pnpm test src/domain/involvement/involvement-draft.test.ts`
Expected: PASS.

- [ ] **Passo 5: Parar para a autora fazer o commit.** Mensagem sugerida: `feat(involvement): adiciona regras das linhas de envolvidos no cadastro de relato`

---

### Tarefa 2: Envio relato → vínculos

**Arquivos:**
- Create: `client/src/domain/record/create-record-with-involvements.ts`
- Test: `client/src/domain/record/create-record-with-involvements.test.ts`

**Interfaces:**
- Consumes: `createRecord` (`domain/record/api/create-record.service.ts`), `createInvolvement` (`domain/involvement/api/create-involvement.service.ts`), `hasServiceError`, `Involvement.Body`.
- Produces:
  - `type NewRecord = Pick<Record.Model, 'title' | 'description' | 'company_id'>`
  - `type CreateRecordWithInvolvementsResult = { status: 'record_failed'; response: Service.ExceptionResponse } | { status: 'created'; record: Record.Model; failedCount: number }`
  - `createRecordWithInvolvements(record: NewRecord, involvements: Involvement.Body[]): Promise<CreateRecordWithInvolvementsResult>`

Comportamento: chama `createRecord({ ...record, status: 'awaiting_investigation' })`. Se der erro, retorna `record_failed` sem chamar vínculos. Se der certo, dispara todos os `createInvolvement(record.id, body)` em paralelo com `Promise.allSettled`. Conta como falha tanto a promessa rejeitada quanto a resposta em que `hasServiceError` é verdadeiro.

- [ ] **Passo 1: Escrever os testes** com `vi.mock` dos dois serviços (`vi.mocked(createRecord).mockResolvedValue(...)`):

| Teste | Arrange | Assert |
| --- | --- | --- |
| `sends awaiting_investigation as status` | record ok, sem vínculos | `createRecord` chamado com `{ title, description, company_id, status: 'awaiting_investigation' }` |
| `returns record_failed and creates no involvements when the record fails` | `createRecord` → `{ statusCode: 500, error: {...} }` | `status === 'record_failed'`, `response` é o mesmo objeto, `createInvolvement` não chamado |
| `creates no involvements when the list is empty` | record ok, `[]` | `{ status: 'created', failedCount: 0 }`, `createInvolvement` não chamado |
| `links every involvement to the created record id` | record ok com `id: 42`, 2 vínculos | `createInvolvement` chamado com `(42, { person_id: 1, type: 'whistleblower' })` e `(42, { person_id: 2, type: 'witness' })` |
| `counts failed involvements` | 3 vínculos: 1 ok, 1 `ServerException` 409, 1 `new Error('network')` | `{ status: 'created', record, failedCount: 2 }` |
| `counts a rejected involvement as failed` | 2 vínculos: 1 ok, 1 `mockRejectedValue` | `failedCount === 1` |

- [ ] **Passo 2: Rodar e ver falhar**

Run: `docker compose exec frontend pnpm test src/domain/record/create-record-with-involvements.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Passo 3: Implementar** `createRecordWithInvolvements` conforme acima. Ajustar o tipo `Body` de `create-record.service.ts` só se for necessário. Hoje ele já aceita `status`.

- [ ] **Passo 4: Rodar e ver passar**

Run: `docker compose exec frontend pnpm test`
Expected: PASS em todos, incluindo `service.helper.test.ts`.

- [ ] **Passo 5: Parar para a autora fazer o commit.** Mensagem sugerida: `feat(record): adiciona envio de relato com envolvidos`

---

### Tarefa 3: Extrair o select de pessoa

**Arquivos:**
- Create: `client/src/domain/person/components/PersonSelect.tsx`
- Modify: `client/src/domain/involvement/components/CreateInvolvementModal.tsx` (remove `PersonOption`, `personOptions`, `filterPersonOption` e o `<Select>` de pessoa, e passa a usar `PersonSelect`)

**Interfaces:**
- Consumes: `usePeopleContext` (`people`, `isLoading`), `formatCpf`, `onlyDigits`.
- Produces: `PersonSelect({ value, onChange, disabledPersonIds, disabledSuffix }: { value?: Person.Model['id']; onChange?: (id: Person.Model['id']) => void; disabledPersonIds: Person.Model['id'][]; disabledSuffix: string })`

Funciona como controle do antd (`value`/`onChange` injetados pelo `Form.Item`). Rótulo da opção: `` `${name} — ${formatCpf(cpf)}` ``. Quando o id está em `disabledPersonIds`, a opção fica desabilitada e ganha `` ` ${disabledSuffix}` `` no fim. Placeholder, busca por nome/CPF e `loading` iguais aos de hoje. O botão "Cadastrar nova pessoa" continua no `extra` do `Form.Item`, fora do componente.

No `CreateInvolvementModal`: `<PersonSelect disabledPersonIds={involvedPersonIds} disabledSuffix="(já vinculada)" />`.

- [ ] **Passo 1: Implementar** `PersonSelect` e trocar o uso no `CreateInvolvementModal`.

- [ ] **Passo 2: Checar tipos e lint**

Run: `docker compose exec frontend pnpm lint:tsc && docker compose exec frontend pnpm lint`
Expected: sem erros novos em relação à Tarefa 0.

- [ ] **Passo 3: Verificação manual** em `https://localhost:5100/records/1`, "Vincular pessoa":
  - buscar por parte do nome e por CPF com e sem pontuação: as opções filtram como antes;
  - pessoa já vinculada aparece desabilitada com "(já vinculada)";
  - "Cadastrar nova pessoa" → cadastrar → a nova pessoa fica selecionada;
  - vincular → aparece na tabela.

- [ ] **Passo 4: Parar para a autora fazer o commit.** Mensagem sugerida: `refactor(person): extrai select de pessoa reutilizável`

---

### Tarefa 4: Modal unificado de cadastro de relato

**Arquivos:**
- Create: `client/src/domain/involvement/components/InvolvementDraftsFields.tsx`
- Modify: `client/src/domain/record/components/RecordFields.tsx` (prop `showStatus`)
- Modify: `client/src/domain/record/components/CreateRecordModal.tsx`
- Modify: `client/src/pages/Records.page.tsx` (envolver `RecordsView` em `PeopleContextProvider`)

**Interfaces:**
- Consumes: Tarefa 1 (todas), Tarefa 2 (`createRecordWithInvolvements`, `NewRecord`), Tarefa 3 (`PersonSelect`), `CreatePersonModal({ onCreated })`, `usePeopleContext`.
- Produces:
  - `RecordFields({ companies, showStatus = true }: { companies: Company.Model[]; showStatus?: boolean })`: com `false`, não renderiza o `Form.Item` de status. O `EditRecordModal` não muda.
  - `InvolvementDraftsFields()`: sem props; usa `Form.useFormInstance()` e espera os campos `is_anonymous: boolean` e `involvements: InvolvementDraft[]` no form pai.
  - Valores do form de cadastro: `type CreateValues = NewRecord & { is_anonymous: boolean; involvements: InvolvementDraft[] }`, com `initialValues={{ is_anonymous: false, involvements: [] }}`.

**`InvolvementDraftsFields`:**
- Cabeçalho "Envolvidos" com `Switch` "Anônimo" (`Form.Item name="is_anonymous" valuePropName="checked"`). Ao ligar: `form.setFieldValue('involvements', removeWhistleblowers(atual))`.
- `Form.List name="involvements"`, uma linha por item: `PersonSelect` (`disabledPersonIds` = `getSelectedPersonIds` das **outras** linhas, `disabledSuffix="(já selecionada)"`, obrigatório: "Por favor, selecione a pessoa."), `Select` de tipo com `getTypeOptions(isAnonymous)` (obrigatório: "Por favor, selecione o tipo de envolvimento.") e botão remover (`DeleteOutlined`).
- Use `Form.useWatch` para `is_anonymous` e `involvements`.
- Regra do `Form.List`: se `is_anonymous` for falso e `hasWhistleblower(linhas)` também, rejeita com **"Informe pelo menos um relatante ou marque o relato como anônimo."**, exibida via `Form.ErrorList`.
- Abaixo da lista: "Adicionar envolvido" (`PlusOutlined`, `add()`) e "Cadastrar nova pessoa" (`UserAddOutlined`, abre `setIsCreateModalVisible(true)` do contexto de pessoas). Ao criar, `onCreated(person)` faz `add({ person_id: person.id })`, ou seja, uma linha nova já com a pessoa. *(Decisão do plano: um único link em vez de um por linha, para não precisar rastrear de qual linha veio o clique.)*
- `<Show when={isCreatePersonModalVisible}><CreatePersonModal onCreated={...} /></Show>`.

**`CreateRecordModal`:**
- `<RecordFields companies={companies} showStatus={false} />`, um `Divider` e depois `<InvolvementDraftsFields />`.
- `onFinish`: monta `Involvement.Body[]` a partir das linhas (a validação garante `person_id` e `type`) e chama `createRecordWithInvolvements`. Mantém o `await sleep(1000)` do padrão atual.
  - `record_failed` → `handleServiceError(app, response)`. O modal continua aberto e os valores são mantidos.
  - `created` com `failedCount === 0` → `close()` e `fetchRecords()`.
  - `created` com `failedCount > 0` → `close()`, `fetchRecords()`, `app.notification.warning({ message: 'Relato criado com pendências', description })` e `navigate(`/records/${record.id}`)`. `description` exata:
    - 1 falha: `Relato criado, mas 1 envolvido não foi vinculado. Confira no detalhe do relato.`
    - N falhas: `Relato criado, mas N envolvidos não foram vinculados. Confira no detalhe do relato.`

**`Records.page.tsx`:** `CompaniesContextProvider` → `RecordsContextProvider` → `PeopleContextProvider` → `RecordsView`.

- [ ] **Passo 1: Implementar** `showStatus` em `RecordFields`.
- [ ] **Passo 2: Implementar** `InvolvementDraftsFields`.
- [ ] **Passo 3: Ligar tudo** no `CreateRecordModal` e no `Records.page.tsx`.
- [ ] **Passo 4: Checar tipos, lint e testes**

Run: `docker compose exec frontend pnpm lint:tsc && docker compose exec frontend pnpm lint && docker compose exec frontend pnpm test`
Expected: sem erros novos; testes das Tarefas 1 e 2 passando.

- [ ] **Passo 5: Verificação manual** em `https://localhost:5100/records`, "Cadastrar":
  1. Não existe campo de status. Cadastrar com 1 relatante + 1 testemunha → relato aparece com status "Aguardando investigação" e "Identificado"; o detalhe mostra os dois envolvidos.
  2. Toggle desligado, só testemunha → envio bloqueado com "Informe pelo menos um relatante ou marque o relato como anônimo."
  3. Duas linhas de relatante + uma de vítima → ligar "Anônimo" → só a vítima fica; "Relatante" some do select de tipo. Desligar → nada volta e a regra do item 2 vale de novo.
  4. Anônimo ligado, sem envolvidos → cria o relato como "Anônimo".
  5. Linha com pessoa e sem tipo (e o contrário) → bloqueia o envio com a mensagem da linha.
  6. Pessoa escolhida numa linha aparece "(já selecionada)" nas outras; ao remover a linha, ela volta a ficar livre.
  7. "Cadastrar nova pessoa" com linhas já preenchidas → surge uma linha nova com a pessoa criada; as outras não mudam.
  8. Com a API parada (`docker compose stop` do serviço da API), cadastrar → erro aparece, o modal continua aberto e os dados ficam preenchidos. Subir a API de novo.
  9. Falha parcial: com o modal preenchido, excluir em outra aba uma das pessoas escolhidas e então cadastrar → aviso "Relato criado com pendências" com "1 envolvido não foi vinculado" e navegação para o detalhe do relato.
  10. "Editar" um relato existente → select de status continua lá e funciona.
  11. Detalhe do relato → "Vincular pessoa" continua funcionando (regressão da Tarefa 3).

- [ ] **Passo 6: Parar para a autora fazer o commit.** Mensagem sugerida: `feat(record): cadastra relato com envolvidos e toggle de anonimato`
