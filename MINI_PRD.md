# Mini PRD

## Resumo

Hoje o produto cobre operações básicas de empresas e relatos, mas ainda não resolve uma necessidade central da operação: identificar quem está envolvido em cada relato.

Este PRD define o conceito de **Pessoa** e o conceito de **Envolvimento** como frentes complementares para tornar os relatos mais rastreáveis e úteis para investigação.

O usuário principal do sistema é o **membro de comitê**: a pessoa responsável por receber, registrar e investigar relatos dentro de uma empresa.

## Objetivo do produto

Melhorar a qualidade dos relatos ao estruturar o cadastro de pessoas e o vínculo dessas pessoas com os relatos, apoiando o processo de investigação com informações sobre relatantes, testemunhas, vítimas e denunciados.

## Metas da entrega

- Permitir registrar e consultar pessoas no sistema para uso em outros contextos.
- Permitir vincular pessoas a relatos com um tipo de envolvimento definido.
- Tornar essas informações fáceis de consultar no dia a dia operacional.
- Reduzir perda de contexto entre relatos e investigações.

## Não objetivos

- Não cobrir fluxo de investigação completo (tarefas, prazos, responsáveis).
- Não cobrir autenticação ou controle de acesso nesta fase.
- Não cobrir notificações externas (e-mail, WhatsApp) nesta fase.
- Não cobrir aplicativo móvel dedicado nesta fase.

## Épico 1: Pessoa

### Problema

Hoje não existe um cadastro central de pessoas, reutilizável em mais de um relato ou contexto.

### Objetivo do épico

Criar o conceito de pessoa no sistema, com dados básicos e regras de unicidade, de forma independente do épico 2.

Uma mesma pessoa pode estar envolvida em vários relatos com papéis diferentes.

### Dados esperados de pessoa

Campos obrigatórios nesta etapa:

1. Nome completo.
2. CPF.
3. E-mail.
4. Data de nascimento.

Regras de operação:

1. Pessoas pertencem ao sistema, não a uma empresa específica.
2. O CPF deve ser único no sistema.

### Histórias de usuário

1. Como membro de comitê, quero cadastrar pessoas para utilizá-las no vínculo com relatos.
2. Como membro de comitê, quero consultar pessoas cadastradas para localizar contatos e reutilizar em novos vínculos.

### Indicadores de sucesso do épico

1. O membro de comitê consegue cadastrar e consultar pessoas.
2. Não há cadastro duplicado de mesma pessoa (CPF único em uso).

### Cenários de validação sugeridos

1. Cadastrar uma nova pessoa e verificar que ela aparece na listagem.
2. Tentar cadastrar uma pessoa com CPF já existente e verificar a validação.

---

## Épico 2: Envolvimento

### Problema

Os relatos hoje não registram quem está envolvido: quem denunciou, quem foi denunciado, quem testemunhou ou quem foi vítima. Essa informação fica dispersa ou simplesmente não é registrada.

### Objetivo do épico

Permitir vincular pessoas a relatos com um tipo de envolvimento, tornando o relato mais completo e rastreável.

### Tipos de envolvimento

1. Relatante (`whistleblower`).
2. Testemunha (`witness`).
3. Vítima (`victim`).
4. Denunciado (`denounced`).

### Regras de operação

1. Uma pessoa pode aparecer apenas uma vez por relato.
2. Um relato sem nenhum envolvido do tipo relatante é considerado anônimo.
3. A responsabilidade pelo anonimato é do envolvimento, não do relato.

### Histórias de usuário

1. Como membro de comitê, quero vincular pessoas a um relato com seu tipo de envolvimento para saber quem está relacionado ao caso.
2. Como membro de comitê, quero consultar os envolvidos de um relato para apoiar a investigação.
3. Como membro de comitê, quero ver claramente se um relato é anônimo, para não precisar inspecionar a lista de envolvidos manualmente.

### Indicadores de sucesso do épico

1. Todo relato pode ter seus envolvidos registrados e consultados.
2. A distinção entre relatos anônimos e identificados fica clara e rastreável.
3. A investigação ganha contexto sobre quem está envolvido em cada caso.

### Cenários de validação sugeridos

1. Vincular uma pessoa a um relato com um tipo de envolvimento e verificar o vínculo.
2. Verificar se um relato sem envolvido do tipo relatante é identificado como anônimo.
3. Testar um cenário de falha relevante (por exemplo, dado obrigatório ausente ou vínculo inválido).
