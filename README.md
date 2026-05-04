# 🇵🇹 Viva Portugal – Plataforma de Turismo Rural

## 🌟 Visão Geral do Projeto

O projeto **Viva Portugal!** é uma plataforma inovadora, desenvolvida para revitalizar e promover o turismo rural em Portugal. Através de uma aplicação web e mobile, a plataforma conecta anfitriões que desejam partilhar experiências autênticas (como vindimas, passeios pela natureza, produção de azeite, entre outras) com pessoas que procuram vivências únicas e imersivas no ambiente rural português.

### Propósito e Valor

O principal objetivo do Viva Portugal! é facilitar a interação entre pessoas (anfitriões e hóspedes), proporcionando uma experiência de reserva e gestão de atividades simplificada e segura. A plataforma visa:

- **Empoderar Anfitriões**: Oferecer ferramentas para que proprietários rurais possam divulgar e gerir as suas experiências de forma eficiente.
- **Enriquecer Hóspedes**: Proporcionar acesso fácil a uma vasta gama de atividades de turismo rural, promovendo o conhecimento e a valorização da cultura e paisagem portuguesa.
- **Inovação Tecnológica**: Integrar funcionalidades avançadas como autenticação segura (OTP, Google OAuth), chat em tempo real, avaliações, check-in/out com QR code, e um chatbot inteligente (MarIA) alimentado por IA para suporte e interação.

## 🧱 Arquitetura do Sistema

A arquitetura do projeto Viva Portugal é modular e distribuída, composta por três componentes principais que interagem para oferecer uma experiência completa e integrada:

```
PROJETO_FINAL_TPSI_CAS/
├── back-end/          # API RESTful (Node.js + Express + MongoDB)
├── front-end/         # Aplicação Web (React + Vite + Tailwind CSS)
├── mobile/            # Aplicação Móvel (React Native / Expo SDK 54)
└── README.md
```

### Componentes Principais:

- **Backend (API RESTful)**:
  - Desenvolvido em Node.js com o framework Express, serve como o cérebro da aplicação, gerindo toda a lógica de negócio, autenticação, persistência de dados e integração com serviços externos.
  - Utiliza MongoDB como base de dados, através do ODM Mongoose, para armazenamento flexível e escalável de informações.
  - Responsável por funcionalidades críticas como autenticação de utilizadores (JWT, OTP), gestão de experiências, reservas, chat, avaliações, e integração com AWS S3 para armazenamento de ficheiros e Nodemailer para envio de emails.

- **Frontend Web (Aplicação Web)**:
  - Construído com React, utilizando Vite para um ambiente de desenvolvimento rápido e Tailwind CSS para estilização eficiente e responsiva.
  - Oferece uma interface de utilizador intuitiva para anfitriões e hóspedes, permitindo a gestão de perfis, criação/reserva de experiências, interação via chat e acesso ao chatbot MarIA.
  - Integra Leaflet e React-Leaflet para visualização e interação com mapas, essencial para a geolocalização de experiências.

- **App Mobile (Aplicação Móvel)**:
  - Desenvolvido com React Native e Expo (SDK 54), garantindo compatibilidade com plataformas iOS e Android a partir de uma única base de código.
  - Foca-se na experiência do utilizador em movimento, com funcionalidades como geolocalização (`expo-location`), leitura de QR codes (`expo-camera`) para check-in/out, e navegação otimizada.
  - Permite aos utilizadores acederem a todas as funcionalidades principais da plataforma, incluindo a reserva de experiências, chat e interação com o chatbot.

## ⚙️ Tecnologias e Dependências

O projeto Viva Portugal emprega um conjunto robusto de tecnologias modernas para garantir desempenho, escalabilidade e uma experiência de utilizador rica.

### 🔧 Backend

| Dependência             | Versão (aproximada) | Finalidade                                    |
| :---------------------- | :------------------ | :-------------------------------------------- |
| Node.js                 | 18+                 | Ambiente de execução JavaScript               |
| Express                 | ^4.18               | Framework web para API RESTful                |
| mongoose                | ^7.x                | ODM (Object Data Modeling) para MongoDB       |
| bcryptjs                | ^2.4                | Biblioteca para hashing de passwords          |
| jsonwebtoken            | ^9.0                | Geração e validação de JSON Web Tokens        |
| dotenv                  | ^16.3               | Carregamento de variáveis de ambiente         |
| cors                    | ^2.8                | Middleware para Cross-Origin Resource Sharing |
| cookie-parser           | ^1.4                | Parser de cookies HTTP                        |
| multer                  | ^1.4                | Middleware para upload de ficheiros           |
| @aws-sdk/client-s3      | ^3.x                | SDK para interação com AWS S3                 |
| nodemailer              | ^6.9                | Envio de emails (OTP, comprovativos)          |
| passport                | ^0.7                | Middleware de autenticação modular            |
| passport-google-oauth20 | ^2.0                | Estratégia de autenticação Google OAuth (web) |
| google-auth-library     | ^9.x                | Validação de tokens Google (mobile)           |
| pdfkit                  | ^0.13               | Geração de documentos PDF                     |
| qrcode                  | ^1.5                | Geração de códigos QR                         |
| image-downloader        | ^4.3                | Download de imagens via URL                   |
| mime-types              | ^2.1                | Deteção de tipos MIME                         |

**Scripts de Execução Comuns**:

```bash
npm install          # Instala todas as dependências do backend
npm start            # Inicia o servidor da API RESTful
```

### 🌐 Frontend Web

| Dependência           | Versão  | Finalidade                                        |
| :-------------------- | :------ | :------------------------------------------------ |
| react                 | ^19.2.4 | Biblioteca JavaScript para construção de UIs      |
| react-dom             | ^19.2.4 | Ponto de entrada para renderização React no DOM   |
| react-router-dom      | ^7.14.0 | Roteamento declarativo para aplicações React      |
| axios                 | ^1.15.0 | Cliente HTTP baseado em Promises                  |
| react-calendar        | ^6.0.1  | Componente de calendário para seleção de datas    |
| react-date-range      | ^2.0.1  | Componente para seleção de intervalos de datas    |
| date-fns              | ^4.1.0  | Biblioteca utilitária para manipulação de datas   |
| react-markdown        | ^10.1.0 | Componente para renderização de Markdown          |
| @google/generative-ai | ^0.24.1 | SDK para integração com a API Gemini (chatbot)    |
| tailwindcss           | ^4.2.2  | Framework CSS utilitário para estilização         |
| vite                  | ^8.0.4  | Ferramenta de build e servidor de desenvolvimento |
| leaflet               | ^1.9.4  | Biblioteca JavaScript para mapas interativos      |
| react-leaflet         | ^4.x    | Componentes React para integração com Leaflet     |

**Instalação Adicional (se necessário)**:

```bash
npm install leaflet react-leaflet
```

**Scripts de Execução Comuns**:

```bash
npm install          # Instala todas as dependências do frontend web
npm run dev          # Inicia o servidor de desenvolvimento (Vite)
npm run build        # Compila a aplicação para produção
npm run preview      # Pré-visualiza a build de produção
```

### 📱 App Mobile (React Native / Expo)

| Dependência                               | Versão (final) | Finalidade                                           |
| :---------------------------------------- | :------------- | :--------------------------------------------------- |
| expo                                      | ~54.0.33       | Plataforma e ferramentas para desenvolvimento mobile |
| react                                     | 19.1.0         | Biblioteca JavaScript para construção de UIs         |
| react-native                              | 0.81.5         | Framework para construção de aplicações nativas      |
| @react-navigation/native                  | ^7.2.2         | Biblioteca de navegação para React Native            |
| @react-navigation/native-stack            | ^7.14.12       | Navegador de pilha para React Native                 |
| @react-navigation/bottom-tabs             | ^7.15.11       | Navegador de abas inferiores                         |
| axios                                     | ^1.15.2        | Cliente HTTP baseado em Promises                     |
| @expo/vector-icons                        | ^15.1.1        | Conjunto de ícones (Ionicons, MaterialIcons, etc.)   |
| @react-native-async-storage/async-storage | 2.2.0          | Armazenamento persistente de dados localmente        |
| expo-location                             | ~19.0.8        | Acesso à localização do dispositivo                  |
| expo-camera                               | ~17.0.10       | Acesso à câmara do dispositivo                       |
| expo-image-picker                         | ~17.0.11       | Acesso à galeria de imagens do dispositivo           |
| expo-auth-session                         | (instalada)    | Integração com provedores de autenticação (Google)   |
| expo-web-browser                          | (instalada)    | Componente para abrir URLs no navegador              |
| react-native-calendars                    | ^1.1314.0      | Componente de calendário para React Native           |
| react-native-qrcode-svg                   | ^6.3.21        | Geração de códigos QR em SVG                         |
| react-native-svg                          | 15.12.1        | Suporte para gráficos SVG                            |
| react-native-safe-area-context            | ~5.6.0         | Utilitário para lidar com áreas seguras do ecrã      |
| react-native-screens                      | ~4.16.0        | Otimização de desempenho para navegação              |
| react-native-toast-message                | (instalada)    | Exibição de mensagens "toast"                        |
| react-native-maps                         | (instalada)    | Componentes de mapa nativos (iOS/Android)            |

**Instalação Adicional (se necessário)**:

```bash
npx expo install react-native-maps
```

**Scripts de Execução Comuns**:

```bash
npm install          # Instala todas as dependências do mobile
npx expo start --clear # Inicia o servidor de desenvolvimento Expo
```

## 🔧 Configuração de Ambiente

Para o correto funcionamento do projeto, é crucial configurar as variáveis de ambiente em cada módulo. As chaves sensíveis e credenciais devem ser geridas através de ficheiros `.env` e nunca devem ser versionadas.

### Backend (`back-end/.env`)

Crie um ficheiro `.env` na raiz do diretório `back-end/` com as seguintes variáveis. Substitua os valores entre `...` pelas suas credenciais e configurações:

```ini
PORT=3000
MONGO_URI=mongodb://localhost:27017/vivaportugal # Exemplo: URL de conexão ao MongoDB
JWT_SECRET_KEY=sua_chave_secreta_jwt             # Chave secreta para JWT
S3_ACCESS_KEY=seu_aws_access_key                 # Chave de acesso AWS S3
S3_SECRET_KEY=seu_aws_secret_key                 # Chave secreta AWS S3
BUCKET=seu_nome_de_bucket_s3                     # Nome do bucket AWS S3
EMAIL_HOST=smtp.gmail.com                        # Host SMTP para envio de emails
EMAIL_PORT=587                                   # Porta SMTP
EMAIL_SECURE=false                               # Usar TLS/SSL
EMAIL_USER=seu_email@gmail.com                   # Email remetente
EMAIL_PASS=sua_senha_de_app_email                # Senha de aplicação do email
GOOGLE_CLIENT_ID=seu_google_client_id_web        # Client ID do Google para web
GOOGLE_CLIENT_SECRET=seu_google_client_secret_web # Client Secret do Google para web
FRONTEND_URL=http://localhost:5173               # URL do frontend web
```

### Frontend Web (`front-end/.env`)

Crie um ficheiro `.env` na raiz do diretório `front-end/`:

```ini
VITE_AXIOS_BASE_URL=http://localhost:3000        # URL base da API do backend
VITE_GEMINI_API_KEY=sua_chave_gemini             # Chave de API para o Gemini Chatbot
```

### Mobile (`mobile/.env`)

Crie um ficheiro `.env` na raiz do diretório `mobile/`:

```ini
API_URL=http://192.168.x.x:3000                  # URL da API do backend (substituir pelo IP da sua máquina na rede local)
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_gemini      # Chave de API pública para o Gemini Chatbot
```

### Mobile (`mobile/app.json` – bloco `extra`)

Adicione o seguinte bloco `extra` ao ficheiro `app.json` no diretório `mobile/`. Substitua os valores pelos seus Client IDs do Google para cada plataforma:

```json
"extra": {
  "API_URL": "http://<IP_DA_REDE>:3000",
  "GOOGLE_WEB_CLIENT_ID": "seu_google_client_id_web",
  "GOOGLE_IOS_CLIENT_ID": "seu_google_client_id_ios",
  "GOOGLE_ANDROID_CLIENT_ID": "seu_google_client_id_android"
}
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

Para garantir uma execução bem-sucedida do projeto, certifique-se de ter os seguintes pré-requisitos instalados e configurados no seu ambiente de desenvolvimento:

- **Node.js**: Versão 18 ou superior.
- **MongoDB**: Uma instância de MongoDB (local ou um serviço de cloud como MongoDB Atlas) a ser executada e acessível.
- **Expo Go**: Aplicação instalada num dispositivo móvel (iOS ou Android) para testar a aplicação mobile.
- **Conta Google Cloud**: Necessária para configurar o Google OAuth e obter chaves de API para o Gemini. Certifique-se de que as APIs relevantes estão ativadas.
- **Conta AWS**: Necessária para configurar um bucket S3 para armazenamento de ficheiros de imagem. Configure as credenciais de acesso.

### Passos de Execução

Siga os passos abaixo para configurar e iniciar cada componente do projeto:

1.  **Backend**

    ```bash
    cd back-end
    npm install
    # Configure o ficheiro .env com as variáveis de ambiente conforme descrito na secção 🔧 Configuração de Ambiente.
    npm start
    ```

    O servidor da API RESTful será iniciado e estará acessível, por padrão, em `http://localhost:3000`.

2.  **Frontend Web**

    ```bash
    cd front-end
    npm install
    npm install leaflet react-leaflet   # Instalação de dependências adicionais para mapas interativos
    npm run dev
    ```

    Após a execução, aceda à aplicação web através de `http://localhost:5173` no seu navegador.

3.  **App Mobile**
    ```bash
    cd mobile
    npm install
    npx expo install react-native-maps   # Instalação opcional, se necessário, para garantir a compatibilidade dos mapas nativos.
    # Configure API_URL no .env e app.json conforme descrito na secção 🔧 Configuração de Ambiente.
    npx expo start --clear
    ```
    Para visualizar a aplicação móvel, leia o QR code exibido no terminal com a aplicação Expo Go instalada no seu telemóvel. Certifique-se de que o dispositivo móvel e o computador estão na mesma rede Wi-Fi.

> **Nota Importante**: O IP do computador que executa o backend deve estar acessível na mesma rede Wi-Fi que o dispositivo móvel. Se o IP da sua máquina mudar, é necessário atualizar a variável `API_URL` nos ficheiros `.env` e `app.json` do módulo mobile para garantir a comunicação correta com a API.

## 📂 Estrutura Detalhada do Projeto

### Backend (`back-end/`)

```
back-end/
├── config/             # Configurações de ligação ao MongoDB e outros serviços
├── domains/            # Módulos de domínio, cada um com sua lógica de negócio e modelos
│   ├── auth/           # Gestão de autenticação (registo, login, OTP, Google OAuth)
│   ├── places/         # Gestão de anúncios de experiências rurais
│   ├── bookings/       # Gestão de reservas de experiências
│   ├── chat/           # Funcionalidades de chat entre utilizadores
│   ├── reviews/        # Gestão de avaliações de experiências e utilizadores
│   ├── demands/        # Gestão de pedidos de suporte e contacto
│   ├── tokens/         # Modelos e lógica para tokens (e.g., OTP)
│   └── users/          # Gestão de perfis de utilizadores
├── routes/             # Definição das rotas da API principal
├── utils/              # Utilitários diversos (geração de JWT, envio de email, PDF, etc.)
├── server.js           # Configuração e inicialização do servidor Express
└── index.js            # Ponto de entrada principal da aplicação backend
```

### Frontend Web (`front-end/`)

```
front-end/
├── src/
│   ├── components/     # Componentes React reutilizáveis (Header, Footer, ChatBot, Cards, etc.)
│   ├── contexts/       # Contextos React para gestão de estado global (UserContext, ThemeContext)
│   ├── pages/          # Páginas da aplicação (Home, Login, Register, Detalhe da Experiência, Conta, etc.)
│   ├── services/       # Configurações e serviços Axios para chamadas à API do backend
│   └── App.jsx         # Componente principal da aplicação web, onde o roteamento é definido
├── public/             # Ativos estáticos (imagens, ícones, manifest.json)
└── package.json        # Metadados do projeto e lista de dependências
```

### Mobile (`mobile/`)

```
mobile/
├── src/
│   ├── components/     # Componentes React Native reutilizáveis (BackButton, StarRating, ReviewModal, FloatingChatButton, etc.)
│   ├── contexts/       # Contextos React Native para gestão de estado global (AuthContext, ChatbotContext)
│   ├── navigation/     # Estrutura de navegação da aplicação (AppNavigator com Stacks e BottomTabs)
│   ├── screens/        # Ecrãs da aplicação (Home, Detalhe da Experiência, Reservas, Perfil, etc.)
│   ├── services/       # Configurações e serviços Axios para chamadas à API (api.js)
│   └── config.js       # Ficheiro de configuração da URL da API e outras constantes
├── assets/             # Ativos estáticos (imagens, fontes, ícones)
├── app.json            # Configurações do Expo e da aplicação móvel
└── App.js              # Ponto de entrada principal da aplicação móvel
```

## ✅ Funcionalidades Chave

O projeto Viva Portugal oferece um conjunto abrangente de funcionalidades, desenhadas para otimizar a experiência de anfitriões e hóspedes:

### 🔐 Autenticação e Gestão de Conta

- **Registo e Login Seguro**: Implementação de registo, login e recuperação de password utilizando OTP (One-Time Password) enviado por email, com validade de 10 minutos, garantindo um processo seguro e eficiente.
- **Login Social Integrado**: Suporte para login com Google (via Passport.js para web e `expo-auth-session` para mobile), facilitando o acesso dos utilizadores.
- **Gestão de Sessão com JWT**: Utilização de JWT (JSON Web Tokens) para autenticação, enviados via cookie (web) ou no corpo da resposta (mobile). Uma rota `GET /auth/me` permite a validação da sessão do utilizador.
- **Edição de Perfil Completa**: Funcionalidades para edição de informações pessoais do perfil (nome, morada, telefone, data de nascimento).
- **Segurança da Conta Aprimorada**: Alteração de email e password com validação adicional via OTP.
- **Logout Eficiente**: Funcionalidade de logout que garante a remoção segura do token de sessão.

### 🏡 Gestão de Anúncios (Experiências)

- **CRUD Completo**: Operações de criação, listagem, edição e eliminação de anúncios de experiências rurais.
- **Upload de Imagens para AWS S3**: Gestão robusta de fotos de experiências com upload direto para o AWS S3, garantindo escalabilidade e fiabilidade.
- **Filtros Avançados de Pesquisa**: Filtragem de anúncios por preço, número de pessoas, texto livre e distância geográfica (25/50/100 km), permitindo aos hóspedes encontrar experiências relevantes.
- **Geolocalização Precisa**: Campo `location` com tipo GeoJSON Point e índice `2dsphere` no MongoDB para consultas espaciais eficientes, permitindo a pesquisa baseada na proximidade.
- **Gestão de Disponibilidade**: Calendário detalhado com `availableDates` e `bookedDates` para um controle preciso da disponibilidade das experiências.
- **Mapas Interativos**: Mapas integrados nos formulários de criação/edição (web com Leaflet, mobile com `react-native-maps`) e na visualização detalhada do anúncio, melhorando a usabilidade e a descoberta.
- **Informações do Anfitrião**: Exibição clara do nome do anfitrião, avaliação média e total de avaliações, promovendo a transparência.

### 📅 Sistema de Reservas

- **Criação de Reservas Inteligente**: Processo de criação de reservas com validação de conflitos de datas e cálculo automático de noites/total, simplificando a gestão para anfitriões.
- **Confirmação e Comprovativo Digital**: Geração de um código de reserva único e envio de email com comprovativo em PDF (inclui QR code), garantindo um registo formal da reserva.
- **Reenvio de Comprovativo**: Funcionalidade para reenvio do comprovativo de reserva, caso necessário.
- **Histórico Detalhado**: Visualização do histórico de reservas para hóspedes e anfitriões, permitindo um acompanhamento completo.
- **Cancelamento Flexível**: Opções de cancelamento pelo hóspede (com regra de 48h antes da experiência) e pelo anfitrião, oferecendo flexibilidade.
- **Check-in/out com QR Code**: Funcionalidade de check-in/out via leitura de QR code (câmara) na aplicação móvel, agilizando o processo no local.

### 💬 Sistema de Chat

- **Comunicação Direta e Eficaz**: Sistema de chat em tempo real entre hóspedes e anfitriões, iniciado através do botão “Dúvidas? Me contacte” no detalhe da experiência.
- **Notificações de Mensagens**: Lista de conversas com badge de mensagens não lidas, garantindo que nenhuma comunicação importante seja perdida.
- **Mensagens de Sistema Automatizadas**: Envio automático de mensagens de sistema para eventos como confirmação de reserva ou cancelamento, mantendo todos informados.
- **Atualização em Tempo Real (Mobile)**: Polling automático a cada 5 segundos na aplicação móvel para verificar novas mensagens e manter a conversa atualizada, proporcionando uma experiência fluida.

### ⭐ Sistema de Avaliações

- **Avaliação Dupla e Justa**: Hóspedes avaliam a experiência e o anfitrião; anfitriões avaliam o hóspede, promovendo um feedback equilibrado.
- **Prazo de Avaliação Definido**: Prazo de 7 dias após o check-out para submissão de avaliações, incentivando a participação.
- **Exibição Transparente**: Avaliações exibidas no detalhe do lugar e no perfil do utilizador, aumentando a confiança na plataforma.
- **Média de Avaliações**: Cálculo e exibição da média de avaliações para experiências e utilizadores.

### 🤖 Chatbot MarIA (Integração Gemini)

- **Assistente Virtual Inteligente**: Chatbot 24/7 especializado em turismo rural português, oferecendo suporte e informações aos utilizadores.
- **Tecnologia Avançada**: Utiliza o modelo `gemini-2.5-flash-lite` via API Gemini, garantindo respostas rápidas e relevantes.
- **Acessibilidade Universal**: Contexto global com `ChatbotContext` e botão flutuante disponível em todas as áreas autenticadas da plataforma.
- **Histórico de Conversa Persistente**: Manutenção do histórico da conversa durante a sessão, permitindo interações contínuas e contextuais.

### 📍 Check-in / Check-out (Mobile)

- **Ecrã Dedicado e Otimizado**: Ecrã específico para check-in/out com leitura de QR code (câmara) ou inserção manual do código de reserva.
- **Confirmação Visual Instantânea**: Confirmação visual da reserva e ações de check-in/out, proporcionando clareza e segurança.

### 🛠️ Suporte e Administração

- **Formulário de Demanda**: Formulário de contacto para suporte disponível nas aplicações web e mobile, facilitando a comunicação com a equipa de apoio.
- **Painéis de Administração Robustos**: Painéis dedicados para administradores, superadministradores e equipa de suporte, permitindo a gestão eficiente da plataforma.
- **Gestão Completa de Recursos**: Gestão de utilizadores, anúncios, reservas e auditoria, garantindo o controlo total sobre as operações.

### 🌙 Outras Funcionalidades

- **Modo Escuro (Web)**: Implementação de modo escuro na aplicação web com toggle, oferecendo personalização da interface.
- **Responsividade Total**: Design totalmente responsivo para web e mobile, garantindo uma experiência consistente em qualquer dispositivo.
- **Validação e Tratamento de Erros**: Validação rigorosa de dados no backend e tratamento global de erros de rede (mobile), aumentando a robustez da aplicação.
- **Formatação de Preço Dinâmica**: Formatação condicional de preço (diária/atividade) para maior clareza.
- **Reset de Datas Automático**: Reset automático da seleção de datas após a conclusão de uma reserva, otimizando o fluxo do utilizador.

## 🧪 Testes e Qualidade

Foram realizados testes manuais exaustivos em ambas as plataformas (web e mobile) para garantir a estabilidade, funcionalidade e usabilidade do sistema.

## 📌 Notas Importantes para Desenvolvimento e Implantação

- **Segurança das Variáveis de Ambiente**: As variáveis de ambiente contêm informações sensíveis e **nunca** devem ser commitadas para o controlo de versão. Certifique-se de que o ficheiro `.env` está devidamente incluído no `.gitignore` de cada módulo.
- **Configuração de Rede para Mobile**: O IP do computador que executa o backend deve estar acessível na mesma rede Wi-Fi que o dispositivo móvel. É fundamental atualizar a variável `API_URL` nos ficheiros `.env` e `app.json` do módulo mobile sempre que a configuração de rede mudar.
- **Permissões de Dispositivo**: Para utilizar funcionalidades como a câmara (para check-in/out) e a geolocalização (para mapas interativos na criação de anúncios) na aplicação móvel, é necessário que o utilizador conceda as permissões solicitadas pelo dispositivo.

## 👥 Créditos

Este projeto foi desenvolvido no âmbito do curso TPSI. Agradecemos a todos os envolvidos na sua conceção e implementação.

**Projeto por**: Hudson Peres e Tássia Nascimento.
