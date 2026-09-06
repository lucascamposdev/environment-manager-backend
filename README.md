# Environment Manager (Backend)

---

# Autenticação

Autenticação baseada em **sessão no banco** (cookie `sid` no servidor, via Postgres) + **CSRF token** para as rotas que alteram estado.

## 1. Login

- O servidor recebe o `e-mail` e a `senha` e verifica se as credenciais estão corretas.
- Se as credenciais forem válidas, qualquer sessão anterior é descartada e uma nova sessão é criada.
- O `userId` do usuário é associado à nova sessão.
- Um `secret` aleatório (`_csrf`) é gerado e também armazenado na sessão.
- A partir desse `secret`, é gerado o `csrfToken`, que é enviado ao frontend na resposta.
- A sessão (`userId` + `_csrf`) é salva no banco de dados. O servidor também envia um `cookie` com o identificador da sessão (`sid`). Esse cookie é usado posteriormente para localizar a sessão do usuário.
- No navegador, o `sid` é armazenado como cookie e o `csrfToken` fica na memória do frontend. O token é enviado novamente no header das requisições que alteram o estado da aplicação.

```
                                                /auth/login
                                                    ↓
                                              Checa Credenciais
                                              ↓                ↓
                                            Válido        Inválido (403)
                                              ↓
                                    -------------------
                                    |     Sessão (DB) |
                                    |-----------------|
                                    |       sid       |
                                    |     userId      |
                                    |  _crsf (secret) |
                                    -------------------
                                              ↓
                                    -------------------
                                    |  Resposta (200) |
                                    |-----------------|
                                    |    csrfToken    |
                                    -------------------
                                              ↓
                                    -------------------
                                    |     Cookie      |
                                    |-----------------|
                                    |       sid       |
                                    -------------------
```

## 2. Cookie de sessão

| Atributo   | Valor    | Por quê                                                                                                                  |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `HttpOnly` | sim      | JavaScript no navegador não consegue ler o cookie, mitiga roubo de sessão via XSS.                                       |
| `Secure`   | `"auto"` | só é enviado em HTTPS.                                                                                                   |
| `SameSite` | `Lax`    | o navegador não envia o cookie em requisições cross-site que não sejam navegação de topo, primeira barreira contra CSRF. |
| `maxAge`   | 7 dias   | validade da sessão; renovada a cada uso.                                                                                 |

O cookie guarda apenas o **ID da sessão** (`sid`).

## 3. CSRF Token

O cookie prova que a requisição veio do navegador com a sessão certa, mas **não prova que foi o próprio usuário quem a disparou** (um site malicioso também consegue fazer o navegador enviar o cookie). Por isso, toda rota que altera estado exige também o header:

```
X-CSRF-Token: <token recebido no login ou em /auth/csrf>
```

Um `preHandler` compara esse header com o segredo guardado na sessão. Se faltar ou for inválido, responde `403 Invalid csrf token`, nunca deixa a requisição chegar ao controller.

## 4. Recuperando o token após um refresh (F5)

O `csrfToken` só existe na memória do frontend (nunca deve ir para `localStorage`/cookie). Quando a página recarrega e essa memória se perde, o frontend chama:

```
GET /auth/csrf   (preHandler: requireAuth)
```

O cookie `sid` já vai automaticamente na requisição, o servidor identifica a sessão existente e devolve um novo `csrfToken` derivado do **mesmo** segredo — sem precisar logar de novo.

---

# Segurança

| Ataque                              |    Status     |                                                                                                                                                    Detalhes |
| :---------------------------------- | :-----------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------: |
| CSRF                                |      ✅       |                                                        é necessário o envio do `CRSRF Token` em todas as rotas que alteram estado, token amarrado à sessão. |
| Session Hijacking / Fixation        |      ✅       |                        Cookie `sid` HttpOnly+SameSite=Lax; `session.regenerate()` no login troca o ID (evita fixation); sessão antiga é destruída no store. |
| SQL Injection                       |      ✅       |                                                                                                                  100% via Prisma com queries parametrizadas |
| Brute force / credential stuffing   |      ✅       |                                  Rate limit de 5 req/min em /login, /forgot-password, /reset-password; senha com scrypt + salt aleatório + timingSafeEqual. |
| Mass assignment                     |      ✅       |                                                                           Zod valida/filtra campos aceitos; services montam o data do Prisma campo a campo. |
| Clickjacking                        |      ✅       |                                                                                                                      helmet.frameguard: { action: "deny" }. |
| MIME sniffing                       | ✅ Protegido  |                                                                                                             Helmet ativa `X-Content-Type-Options: nosniff`. |
| Enumeração de usuário no login      | ✅ Protegido  |                                                                                                            Mensagem genérica `"Invalid email or password"`. |
| Privilege escalation (self-promote) | ✅ Protegido  |                                                                                 `updateRole` bloqueia auto-alteração; criação de usuário não aceita `role`. |
| XSS (refletido/armazenado)          | ✅ Protegido  |                                                                                                             API só devolve JSON + CSP `default-src 'none'`. |
| HTTPS / HSTS                        |  ⚠️ Parcial   | Helmet manda HSTS e cookie usa `secure: "auto"`, mas atrás de proxy reverso em produção vai precisar de `trustProxy: true` no Fastify (ainda não ajustado). |
| Account takeover via reset de senha | 🔴 Proposital |                                                                                                                                     Sem mailer configurado. |
