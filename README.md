# Contato Seguro Slim ⚡️

Este projeto é dedicado à etapa técnica do processo seletivo para novos desenvolvedores.

> [!IMPORTANT]
> **Aviso para colaboradores Contato Seguro** \
> A *branch* `main` não deve ser enviada para os candidatos. \
> O repositório possui *branches* dedicadas para cada etapa do processo seletivo.

## Ambiente de desenvolvimento local

Por padrão, os candidatos recebem o projeto como um arquivo compactado.

> [!TIP]
> Você pode usar qualquer sistema operacional, seja ele **Windows** ou **Linux**.\
> Essa é a magia do **Docker** 🐳

### Requisitos

- Uma ferramenta para descompactar o arquivo compactado, como **WinRAR** ou **7-Zip**
- Uma **IDE**, como **Visual Studio Code**
- **Docker** e **Docker Compose**

### Instalação

1. Descompactar o arquivo compactado em um local de sua escolha
2. Acessar o local escolhido no passo anterior
3. Inicializar os containers
    ```bash
    docker compose up -d
    ```
4. Acessar o container da **API**
    ```bash
    docker compose exec api bash
    ```   
5. Instalar as dependências com **Composer**
    ```bash
    composer install
    ```   
6. Configurar o banco de dados com **Phinx**
    ```bash
    composer run phinx:migrate
    ```
7. Popular o banco com dados de exemplo
    ```bash
    composer run phinx:seed
    ```

**A API estará disponível em http://localhost:8080 e o front-end em https://localhost:5100 ⚡️**

#### Como derrubar os containers?

```bash
docker compose stop
```

#### Como subir os containers novamente?

```bash
docker compose up -d
```

### Insomnia

> [!NOTE]
> Você pode usar outras ferramentas, como **Postman**, mas sugerimos **fortemente** que use o **Insomnia**, já que a coleção está pronta e configurada, facilitando muito o seu trabalho.

1. Abra o **Insomnia**
2. Clique em **"Create"** e escolha **"File"** -> **"Import"** -> **"From File"**
3. Selecione o arquivo `server/insomnia.json`.
  
Todas as rotas estarão disponíveis para teste 💫

## Contexto da etapa técnica

A proposta desta etapa é simular um cenário real de trabalho com autonomia de análise, documentação, implementação e validação.

Durante esta etapa, você deve:

1. Interpretar um **PRD** em linguagem de produto;
2. Documentar seu entendimento em um *design plan*;
3. Implementar a solução;
4. Validar os cenários manualmente e documentar as evidências;
5. Responder o formulário obrigatório ao final.

O PRD desta etapa está em [MINI_PRD.md](MINI_PRD.md).

O back-end para este PRD já está desenvolvido. Para entender os contratos de cada rota (*shapes*, *enums*, regras de negócio), consulte [API.md](API.md).

Você tem liberdade para definir como as telas serão construídas e organizadas. Adicionar novas funcionalidades, telas, indicadores ou gráficos além do que o PRD pede é bem-vindo e conta como bônus de criatividade na avaliação.

A única restrição é que **o back-end não pode ser alterado**. Nenhuma linha de código dentro de `server/` deve ser modificada. Toda a implementação deve acontecer dentro de `client/`.

## Processo da entrega

### Plano de design

Antes de implementar, documente o que você entendeu do PRD e o que pretende construir. Inclua riscos e decisões que considera importantes.

Crie um arquivo em **Markdown** no repositório. O nome e o caminho são livres.

### Plano de implementação (opcional)

Um detalhamento passo a passo de como você vai executar o plano de design. Também em **Markdown**, com nome e caminho livres.

## Testes manuais e evidências

Validar os cenários manualmente é obrigatório. A implementação do *PRD*, a documentação das evidências e o preenchimento do formulário de encerramento são suficientes para a entrega.

### Como documentar

Crie um arquivo em **Markdown** no repositório descrevendo os cenários que você validou. O nome e o caminho do arquivo são livres.

Para cada cenário testado, descreva:

1. O que foi testado.
2. Como foi testado (passos realizados).
3. Qual era o resultado esperado.
4. Qual foi o resultado obtido.

Capturas de tela e gravações de tela são opcionais, mas pelo menos uma evidência visual por épico é bem-vinda.

## Uso de agentes de IA

Você pode usar agentes de IA, como **Claude Code** ou **Cursor**. Nestes casos, é interessante, mas opcional, que a conversa seja exportada e enviada no formulário de encerramento, para entendermos como você trabalha com agentes e como escreve *prompts*.

### Skills recomendadas

Skills são instruções que ensinam o agente a seguir um processo específico. As mais úteis para esta etapa são:

- **brainstorming** — explorar o problema antes de sair implementando
- **writing-plans** — estruturar um plano de design ou implementação
- **executing-plans** — executar um plano passo a passo com checkpoints

Para instalar as três de uma vez:

```bash
npx skills add obra/superpowers --skill brainstorming writing-plans executing-plans -y
```

Você pode explorar outras skills em [skills.sh/obra/superpowers](https://www.skills.sh/obra/superpowers).

## Formulário obrigatório de encerramento

O preenchimento do **Google Form** ao final da entrega é obrigatório.

> [!IMPORTANT]
> Submissões sem formulário preenchido serão desconsideradas.

Para acessar o formulário, clique [aqui](https://forms.gle/tA68FTyZEARSYdYe6).

## Tecnologias 🛠️

O repositório possui dois diretórios principais, sendo `server` para a **API REST** e `client` para uma **Single Page Application (SPA)**, que consome a **API REST**.

### Servidor 📚️

- PHP 8.4
- Slim 4.12
- Phinx 0.15
- Eloquent 12.0

### Cliente 💻️

- React 19
- Ant Design 5
- TypeScript 5
- Dayjs 1
- React Router 7
- Vite
