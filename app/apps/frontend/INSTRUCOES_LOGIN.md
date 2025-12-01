# Sistema de Login - Bombeiro Mirim

## Implementação Concluída ✅

A tela de login do protótipo foi migrada com sucesso para Astro + Svelte com Tailwind CSS.

## Estrutura Criada

### Dependências Adicionadas
- `@astrojs/svelte` - Integração Svelte com Astro
- `@astrojs/tailwind` - Integração Tailwind CSS
- `svelte` - Framework Svelte
- `tailwindcss` - Framework CSS utilitário
- `autoprefixer` - Processador CSS

### Arquivos Criados

1. **`src/stores/auth.ts`** - Store de autenticação Svelte
   - Gerenciamento de estado de login
   - Persistência no localStorage
   - Validação de credenciais

2. **`src/components/Login.svelte`** - Componente de login
   - Formulário interativo
   - Animação do logo
   - Redirecionamento baseado no tipo de usuário

3. **`src/pages/login.astro`** - Página de login
   - Rota: `/login`

4. **Páginas Placeholder:**
   - `src/pages/admin.astro` - Rota: `/admin`
   - `src/pages/docente.astro` - Rota: `/docente`
   - `src/pages/usuario.astro` - Rota: `/usuario`

### Configurações

- **`tailwind.config.mjs`** - Configuração do Tailwind com cores do tema
- **`astro.config.mjs`** - Integrações Svelte e Tailwind
- **`src/styles/global.css`** - Estilos customizados (animações, sombras)

## Como Usar

### 1. Instalar Dependências

```bash
cd frontend
npm install
```

### 2. Executar em Modo Desenvolvimento

```bash
npm run dev
```

### 3. Acessar o Sistema

Abra o navegador em: `http://localhost:4321/login`

## Credenciais de Acesso

### Administrador
- **Usuário:** admin
- **Senha:** 123456
- **Redireciona para:** `/admin`

### Docente
- **Usuário:** prof.silva
- **Senha:** 123456
- **Redireciona para:** `/docente`

### Responsável
- **Usuário:** marcos.pereira
- **Senha:** 123456
- **Redireciona para:** `/usuario`

## Funcionalidades Implementadas

✅ Formulário de login responsivo  
✅ Validação de credenciais  
✅ Persistência de sessão (localStorage)  
✅ Redirecionamento baseado em tipo de usuário  
✅ Animação do logo (floating)  
✅ Design fiel ao protótipo HTML  
✅ Páginas placeholder para cada tipo de usuário  
✅ Botão de logout funcional  
✅ Mensagens de erro amigáveis  

## Próximos Passos

As páginas placeholder (`/admin`, `/docente`, `/usuario`) estão prontas para receber a implementação completa dos seus respectivos sistemas:

- **Admin:** Sistema completo do prototipoadmin.html
- **Docente:** Sistema completo do prototipodocente.html  
- **Usuário:** Sistema completo do prototipousuario.html

## Estrutura de Autenticação

O sistema utiliza um store Svelte (`authStore`) que:
- Valida credenciais contra uma lista predefinida
- Armazena o usuário autenticado no localStorage
- Fornece funções: `login()`, `logout()`, `checkAuth()`
- Mantém o estado: `isLoggedIn`, `currentUser`, `userType`

## Estilos Personalizados

Classes CSS disponíveis:
- `.soft-shadow` - Sombra suave para cards
- `.floating-animation` - Animação flutuante (logo)
- `.modal-overlay` - Overlay com blur para modais
- Cores do tema: `primary` (#E11D48) e `primary-dark` (#BE123C)

## Observações

- O sistema está pronto para desenvolvimento local
- As credenciais são validadas no frontend (apenas para protótipo)
- Em produção, será necessário implementar autenticação no backend
- Todas as rotas estão funcionais e com design responsivo

