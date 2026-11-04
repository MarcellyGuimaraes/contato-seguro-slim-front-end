# Design — Cadastro de relato com envolvidos

## Intenção

Hoje, cadastrar um relato completo exige dois formulários em lugares diferentes: o modal "Cadastrar relato" na listagem e, depois, o modal "Vincular pessoa" no detalhe do relato, uma pessoa por vez. Para uma tarefa relativamente simples, isso é trabalho demais. O objetivo é cadastrar o relato e seus envolvidos num único formulário.

## Objetivos

- Um único modal "Cadastrar relato" com duas partes: dados do relato e envolvidos.
- Status inicial sempre "Aguardando investigação", sem campo na tela de cadastro.
- Toggle "Anônimo" que controla se o relato terá relatante.

## Não objetivos

- Alterar o back-end (`server/` continua intocado, como no `DESIGN_PLAN.md`).
- Mudar o modal de edição de relato (continua com o select de status e sem envolvidos).
- Remover o fluxo de vínculo no detalhe do relato (continua existindo para ajustes posteriores).

## Anti-objetivos

- Relato anônimo sem poder registrar testemunha, vítima ou denunciado.
- Falha em algum vínculo passar em silêncio.
- Aviso de erro que cresce com o número de envolvidos.

## Restrições

- A API cria relato e vínculos em chamadas separadas: `POST /records` e um `POST /records/{id}/involvements` por envolvido.
- `POST /records` ainda exige `status`.
- Anonimato é calculado pelo back-end (`is_anonymous` = nenhum envolvido `whistleblower`); o front não grava anonimato.

## Abordagens consideradas

1. **Lista de linhas no próprio modal com `Form.List` (escolhida).** Cada linha tem pessoa + tipo, com "+ Adicionar envolvido". Tudo numa tela só, validação junto com o resto do form. Escolhida por ser a mais próxima do desenho proposto e não empilhar modais.
2. **Modal em etapas (wizard).** Relato numa etapa, envolvidos na outra. Descartada: devolve a sensação de duas tarefas separadas, que é o incômodo atual.
3. **Tabela + mini-modal de vínculo reaproveitado.** Descartada: modal dentro de modal dentro de modal (o de pessoa já abre por cima), experiência pesada.

## Decisões

**Formulário**

- Parte 1: título, descrição, empresa. Sem status; o front envia `awaiting_investigation` fixo.
- Parte 2: "Envolvidos", com toggle "Anônimo" (desligado por padrão) e lista de linhas `[Pessoa] [Tipo] [remover]` + "Adicionar envolvido".
- Select de pessoa com a mesma busca por nome/CPF e o atalho "Cadastrar nova pessoa" do modal de vínculo atual. A lógica é extraída para ser reaproveitada nos dois lugares.
- Uma pessoa já escolhida em outra linha fica desabilitada nos demais selects, impedindo vínculo duplicado.
- O `RecordFields` deixa de exibir status no cadastro; na edição continua igual.

**Toggle "Anônimo"**

- Ligado: a opção "Relatante" some do select de tipo. Testemunha, vítima e denunciado continuam disponíveis.
- Desligado: é obrigatório ter **pelo menos um** relatante; o envio é bloqueado com mensagem de validação.
- Ao ligar o toggle, as linhas marcadas como relatante são removidas inteiras (pessoa e tipo). As demais linhas não mudam. Como raramente há mais de 3 relatantes por denúncia, refazer em caso de clique errado é pouco trabalho.

**Envio**

1. `POST /records`. Se falhar, mostra o erro como hoje e o modal continua aberto.
2. Se der certo, dispara os `POST /records/{id}/involvements` em paralelo, espera todos terminarem e conta as falhas. Uma falha não interrompe as demais.
3. Todas ok: fecha o modal e atualiza a listagem.
4. Alguma falhou: fecha o modal, mostra *"Relato criado, mas N envolvidos não foram vinculados. Confira no detalhe do relato."* (só o número, sem listar nomes) e navega para `/records/{id}`.

## Deixado para quem implementar

- Onde fica o componente extraído do select de pessoa e como ele é compartilhado.
- Prover o contexto de pessoas na página de Relatos (hoje só tem empresas e relatos).
- Garantir que a coluna "Identificação" da listagem reflita os vínculos recém-criados após o cadastro.
- Texto exato das mensagens de validação, seguindo o padrão das existentes.

## Fora do escopo

- Timeout em `request.ts`: hoje nenhuma requisição tem timeout. É um problema que já existe em todas as telas, não vem desta mudança.
