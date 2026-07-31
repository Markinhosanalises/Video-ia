# Davi e Golias — vídeo gerado automaticamente (100% grátis)

Este projeto gera um vídeo vertical (9:16) automaticamente:
roteiro → imagens por IA → narração por IA → vídeo montado (Remotion) → arquivo .mp4 pronto pra baixar.

**Tudo grátis, sem cartão de crédito e sem precisar criar conta em ferramenta nenhuma** — a geração de imagem e narração usa a Pollinations.ai, uma plataforma aberta e gratuita. Tudo roda no GitHub Actions, sem terminal, sem instalar nada no seu computador.

## Passo a passo (tudo pelo navegador, celular ou PC)

### 1. Criar o repositório no GitHub
1. No GitHub, clique em **New repository**.
2. Dê um nome (ex: `davi-goliath-video`) e crie como **privado** ou público, tanto faz — não tem chave sensível nesse projeto.
3. Clique em **Create repository**.

### 2. Subir os arquivos deste projeto
1. Extraia o zip no seu celular/computador (a maioria dos celulares tem um app de arquivos que "extrai" zip).
2. No repositório vazio, clique em **uploading an existing file**.
3. Arraste **todo o conteúdo da pasta extraída** (não a pasta zipada, o conteúdo dela) pra área de upload.
4. Role pra baixo e clique em **Commit changes**.

### 3. Rodar o gerador de vídeo
1. Vá na aba **Actions** do repositório.
2. Se aparecer um aviso pra habilitar Actions, clique em **I understand my workflows, go ahead and enable them**.
3. Clique em **"Gerar vídeo Davi e Golias"** na lista à esquerda.
4. Clique em **Run workflow** → confirme clicando em **Run workflow** de novo (botão verde).
5. Aguarde uns 3-6 minutos (atualiza a página pra acompanhar: ícone amarelo girando = rodando, verde ✅ = pronto).

### 4. Baixar o vídeo pronto
1. Clique na execução concluída (✅) pra abrir os detalhes.
2. Role até **Artifacts**, no fim da página.
3. Clique em **davi-e-goliath-video** pra baixar o `.mp4`.

Pronto — sem contas, sem cartão, sem chave de API.

## Editar o roteiro
Pra mudar o texto da narração ou as cenas, edite o arquivo `data/roteiro.json` direto pelo GitHub (clique no arquivo → ícone de lápis ✏️) e rode o workflow de novo.

## Trocar a voz da narração
No arquivo `.github/workflows/generate-video.yml`, você pode adicionar uma linha `NARRATION_VOICE` com uma destas opções (todas em inglês, mas leem texto em português normalmente):
- `onyx` — grave, séria (padrão, boa pra narração tipo documentário/bíblico)
- `fable` — tom de contador de histórias
- `echo` — grave e ressonante
- `alloy` — neutra, profissional
- `nova` — clara, animada
- `shimmer` — suave, melódica

## Sobre custos
**Zero.** GitHub Actions é grátis (repositório público tem minutos ilimitados; privado tem 2.000 min/mês grátis, e esse projeto usa poucos minutos por execução). A Pollinations.ai é gratuita e não pede cartão.

**Importante sobre o serviço gratuito**: por ser um serviço aberto e gratuito, a Pollinations pode ocasionalmente ficar mais lenta em horários de pico, ou pedir uma nova tentativa se um pedido falhar. O script já tem uma pequena pausa entre as chamadas pra evitar isso. Se algum episódio falhar no meio, é só rodar o workflow de novo.

## Consistência visual dos personagens
As descrições do Davi e do Golias ficam centralizadas em `data/roteiro.json`, no campo `personagens`. Elas são reaproveitadas em todas as cenas automaticamente (usando `{davi}` e `{golias}` dentro de cada `promptImagem`), o que ajuda a manter a aparência parecida entre as cenas — mas nenhuma IA de imagem gratuita garante 100% de consistência perfeita entre gerações diferentes. Se depois de testar você quiser mais controle e qualidade, dá pra evoluir esse projeto pra usar OpenAI ou outra ferramenta paga com imagem de referência fixa.
