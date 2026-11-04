# 📔 Sistema de Agenda Pessoal de Contatos

Este projeto consiste em um sistema completo de Agenda de Contatos residencial e empresarial. Ele fornece uma interface para controle total de cadastros, leituras, alterações e exclusões (CRUD) utilizando uma arquitetura restrita a **módulos nativos e pacotes leves no Node.js** (com suporte nativo a ES Modules) e persistência robusta com banco de dados **SQLite**.

A interface do usuário é modular e foi dividida de maneira semântica em **5 páginas HTML independentes** para isolar as responsabilidades e fluxos visuais do sistema.

## 🛠️ Tecnologias Utilizadas

- **Back-end:** Node.js (Módulos nativos `http`, `path`, `fs`, `url` via ES Modules)
- **Banco de Dados:** SQLite3 (Módulo `sqlite3`)
- **Front-end:** HTML5, CSS3 estruturado, JavaScript Utilitário (Módulos ESM e Máscaras de entrada)

---

## 💻 Estrutura do Front-end (5 Páginas HTML)

O sistema de arquivos estáticos está organizado na pasta `public/` para permitir que o usuário navegue individualmente pelas operações da agenda através do menu superior de navegação:

1. **`index.html` (Agenda de Contatos - Início):** A tela principal do sistema. Apresenta a seção *"Meus Contatos Salvos"* com uma tabela dinâmica que exibe ID, Nome, E-mail, Telefone, Nascimento e Localidade, além de uma barra de pesquisa para filtrar os registros em tempo real.
2. **`cadastrar.html` (Agenda - Cadastrar):** Contém a seção *"Adicionar Novo Contato"*. Disponibiliza um formulário completo com campos específicos para Nome Completo, E-mail, Telefone, Data de Nascimento, CEP, Rua/Logradouro, Número, Bairro, Cidade e Estado (UF).
3. **`atualizar.html` (Agenda - Atualizar):** Contém duas seções principais: *"Localizar Contato para Atualização"* (onde é possível carregar os dados prévios via ID) e *"Atualizar Informações"*, permitindo modificar os dados cadastrais do contato e clicar em *"Confirmar Modificações"*.
4. **`excluir.html` (Agenda - Excluir):** Tela dedicada à exclusão segura de registros através da seção *"Remover Contato do Sistema"*, que disponibiliza a ação de *"Excluir Permanentemente"*.
5. **`consultar.html` (Consultar Pessoas):** Integrada ao menu sob o título provisório de *"Sistema de Controle de Acesso"*, esta página permite uma busca avançada na seção *"Consultar Pessoas"*, contendo filtros de pesquisa por texto e por tipo de usuário (Todos, Aluno, Professor, Funcionário), listando em tempo real o ID, Nome, E-mail, Nascimento, Tipo e Status.

---

## 🚀 Instalação e Execução

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org) instalado (versão v20.17.0 ou superior recomendada devido às dependências do módulo SQLite).

### Passo a Passo

1. Extraia ou clone os arquivos do projeto em uma pasta.
2. Abra o terminal no diretório raiz do projeto e instale a dependência do banco de dados utilizando:
   ```bash
   npm install
   ```
3. Inicie o servidor da aplicação:
   ```bash
   npm start
   ```
4. O terminal confirmará a inicialização correta com as mensagens:
   ```text
   Banco de dados da Agenda Pessoal pronto.
   Agenda rodando em http://localhost:5000/
   ```
5. Abra o seu navegador preferido e acesse o endereço: **`http://localhost:5000`**

---

## 🌐 Documentação da API REST

A comunicação entre a interface do usuário e o banco de dados é centralizada no endpoint `/api/contatos`. Todas as informações trafegam estruturadas em **JSON** utilizando a codificação padrão `UTF-8`.

### Estrutura Base do Objeto Contato
```json
{
  "id": 1, // Gerado automaticamente de forma sequencial (INTEGER PRIMARY KEY)
  "nome": "João Silva",
  "email": "joao.silva@exemplo.com", // Único (Não duplicável)
  "telefone": "(11) 98888-7777",
  "data_nascimento": "2000-05-15",
  "cep": "01001-000",
  "logradouro": "Praça da Sé",
  "numero": "123",
  "bairro": "Sé",
  "cidade": "São Paulo",
  "estado": "SP"
}
```

### Endpoints Disponíveis

#### 1. Listar ou Filtrar Contatos
* **Método:** `GET`
* **Endpoint:** `/api/contatos`
* **Parâmetro de Busca Opcional:** `?q=termo_da_busca` (Filtra registros correspondentes em tempo real por **ID, Nome, E-mail ou Cidade**)
* **Status de Sucesso:** `200 OK`

#### 2. Obter Detalhes de um Contato Único
* **Método:** `GET`
* **Endpoint:** `/api/contatos?id=:id`
* **Status de Sucesso:** `200 OK`
* **Status de Erro:** `404 Not Found` (Caso o contato não exista)

#### 3. Cadastrar um Novo Contato
* **Método:** `POST`
* **Endpoint:** `/api/contatos`
* **Campos Obrigatórios:** Todos os dados do objeto acima (exceto ID) precisam estar preenchidos.
* **Status de Sucesso:** `201 Created`
* **Status de Erro:** 
  - `400 Bad Request` (Campos ausentes ou formato de CEP inválido)
  - `409 Conflict` (E-mail informado já se encontra cadastrado)

#### 4. Atualizar Dados do Contato
* **Método:** `PUT`
* **Endpoint:** `/api/contatos?id=:id`
* **Status de Sucesso:** `200 OK`
* **Status de Erro:** 
  - `400 Bad Request` (Falha na validação dos campos obrigatórios)
  - `404 Not Found` (ID do contato informado inválido ou inexistente)
  - `409 Conflict` (O e-mail inserido já pertence a outro contato)

#### 5. Deletar Contato Permanentemente
* **Método:** `DELETE`
* **Endpoint:** `/api/contatos?id=:id`
* **Status de Sucesso:** `200 OK`
* **Status de Erro:** `404 Not Found` (Caso o contato não seja localizado no banco)

---

## 📁 Estrutura de Pastas do Projeto

```text
├── package.json         # Manifesto com scripts e dependência do sqlite3
├── package-lock.json    # Histórico de integridade das dependências instaladas
├── app.js               # Código-fonte principal do servidor HTTP e lógica de roteamento REST
├── database.js          # Arquivo de inicialização, tabela e conexão com o SQLite
├── database.sqlite      # Arquivo local gerado onde residem as informações persistidas
└── public/              # Diretório de arquivos estáticos servidos ao cliente
    ├── index.html       # Visualização e filtragem da tabela geral (Meus Contatos Salvos)
    ├── cadastrar.html   # Formulário para inserção de novos registros (Adicionar Novo Contato)
    ├── atualizar.html   # Busca e atualização de dados mutáveis de um contato existente
    ├── excluir.html     # Confirmação para remoção definitiva (Remover Contato do Sistema)
    ├── consultar.html   # Filtros e visualização avançada (Consultar Pessoas)
    ├── style.css        # Folha de estilo e padronização visual em Grid/Flexbox
    └── utils.js         # Módulo utilitário JS contendo máscaras (Telefone/CEP) e alertas
```
