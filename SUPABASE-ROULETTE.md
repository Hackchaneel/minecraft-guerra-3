# Ativar a roleta compartilhada do MG3

A interface do site já usa Supabase Realtime para mostrar o mesmo estado aos visitantes. Para ativar a integração no projeto Supabase:

1. No Dashboard do Supabase, abra **SQL Editor → New query**.
2. Copie e execute o conteúdo de `supabase/migrations/202610200001_mg3_shared_roulette.sql`.
3. Em **Edge Functions → Secrets**, crie `MG3_ADMIN_KEY` com uma senha aleatória forte. Ela será pedida na página `/admin`; não a coloque no código do site nem em `VITE_`.
4. No terminal, dentro da pasta do projeto, entre no CLI e vincule o projeto:

   ```bash
   npx supabase login
   npx supabase link --project-ref rkcjlmootvxwgibqfxwt
   npx supabase functions deploy roulette-admin
   ```

5. Em Vercel → projeto → **Settings → Environment Variables**, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para os ambientes de produção/preview que usa e faça um novo deploy.
6. Abra `/#/admin`, informe `MG3_ADMIN_KEY` e depois acesse `/#/roleta`. Visitantes sem a chave só acompanham o sorteio.

A chave `MG3_ADMIN_KEY` é validada pela Edge Function. A tabela concede leitura pública com RLS, mas não permite gravação pública; as alterações passam pela função administrativa.


