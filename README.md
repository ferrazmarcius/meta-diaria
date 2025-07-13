# 🎯 Meta Diária - SaaS de Gerenciamento Financeiro

Este é um projeto de um SaaS (Software as a Service) full-stack construído do zero, com o objetivo de ajudar usuários a acompanhar e quitar suas dívidas através do registro de metas e ganhos diários.

## 📸 Demonstração

[EM BREVE]

Vou gravar um GIF curto mostrando o fluxo de registro -> login -> criação de meta -> registro de ganho.

---

## ✨ Funcionalidades Principais

* **Autenticação de Usuários:** Sistema completo de registro e login com senhas criptografadas e autenticação segura baseada em JSON Web Tokens (JWT).
* **Rotas Protegidas:** Apenas usuários autenticados podem acessar suas informações e funcionalidades privadas.
* **Criação de Metas:** O usuário pode definir uma meta financeira principal, com valor total e data alvo.
* **Registro de Ganhos:** Funcionalidade para registrar ganhos diários, que são abatidos da meta principal.
* **Dashboard Dinâmico:** Um painel que busca e exibe dados em tempo real, mostrando o progresso da meta, total arrecadado, valor restante e a lista de ganhos registrados.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

* **Front-end:**
    * [React](https://reactjs.org/) (com Hooks)
    * [React Router](https://reactrouter.com/) para roteamento
    * [Axios](https://axios-http.com/) para requisições HTTP
    * CSS puro para estilização básica

* **Back-end:**
    * [Node.js](https://nodejs.org/)
    * [Express.js](https://expressjs.com/) para a construção da API RESTful
    * [PostgreSQL](https://www.postgresql.org/) como banco de dados
    * [Supabase](https://supabase.io/) para hospedagem do banco de dados PostgreSQL
    * [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken) para autenticação
    * [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) para criptografia de senhas
    * [CORS](https://github.com/expressjs/cors) para gerenciamento de acesso entre origens

* **Ferramentas de Desenvolvimento:**
    * [Git](https://git-scm.com/) & [GitHub](https://github.com/) para versionamento
    * [Insomnia](https://insomnia.rest/) para testes de API
    * [DBeaver](https://dbeaver.io/) para gerenciamento de banco de dados

---

## 🚀 Como Executar o Projeto Localmente

Para rodar este projeto na sua máquina, siga os passos abaixo.

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 16 ou superior)
* [PostgreSQL](https://www.postgresql.org/download/) (uma instância local ou uma na nuvem como a da Supabase)
* [Git](https://git-scm.com/downloads)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/meta-diaria.git](https://github.com/seu-usuario/meta-diaria.git)
    cd meta-diaria
    ```

2.  **Instale as dependências do Back-end:**
    ```bash
    cd backend
    npm install
    ```

3.  **Instale as dependências do Front-end:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Configure as Variáveis de Ambiente:**
    * Na pasta `backend`, crie um arquivo `.env`.
    * Copie o conteúdo do arquivo `.env.example` (se você criar um) ou preencha com suas credenciais do banco de dados e um segredo JWT, como fizemos no projeto:
        ```
        DB_USER=...
        DB_HOST=...
        DB_DATABASE=...
        DB_PASSWORD=...
        DB_PORT=...
        JWT_SECRET=...
        ```

### Executando a Aplicação

1.  **Inicie o servidor Back-end:**
    * No terminal, dentro da pasta `backend`:
        ```bash
        npm run dev
        ```
    * O servidor estará rodando em `http://localhost:3001`.

2.  **Inicie o Front-end:**
    * Abra um **novo** terminal e, dentro da pasta `frontend`:
        ```bash
        npm run dev
        ```
    * A aplicação estará disponível em `http://localhost:5173`.

---

## 🔮 Próximos Passos

-   [ ] Adicionar funcionalidades de Editar e Deletar para os ganhos e metas.
-   [ ] Implementar um sistema de notificações/alertas mais elegante no front-end.
-   [ ] Estilizar a aplicação com um framework de CSS ou biblioteca de componentes.
-   [ ] Adicionar gráficos para visualização do progresso.
-   [ ] Fazer o deploy da aplicação na internet.

---

## 👨‍💻 Autor

**[Marcius Silva Ferraz Filho]**

* LinkedIn: `[https://www.linkedin.com/in/marcius-ferraz/]`
* GitHub: `[https://github.com/ferrazmarcius]`