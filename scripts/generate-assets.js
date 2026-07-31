// Gera imagens + narração pra cada cena do roteiro usando a Pollinations.ai
// (plataforma gratuita), mede a duração real de cada áudio (via ffprobe) e
// escreve public/manifest.json, que o Remotion usa pra montar o vídeo final
// com a duração certa de cada cena.
//
// A geração de imagem funciona sem nenhuma chave. A geração de narração,
// nas versões mais recentes da API, pode exigir um token gratuito (sem
// cartão, sem cobrança) criado em auth.pollinations.ai — veja o README
// pra saber como pegar o seu e configurar como Secret POLLINATIONS_TOKEN
// no GitHub.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const roteiro = JSON.parse(fs.readFileSync(path.join(ROOT, "data/roteiro.json"), "utf-8"));

// opcional — deixe em branco se não tiver
const POLLINATIONS_TOKEN = process.env.POLLINATIONS_TOKEN || "";
// vozes disponíveis no modelo de áudio: alloy, echo, fable, onyx, nova, shimmer
const VOICE = process.env.NARRATION_VOICE || "onyx";

const IMG_DIR = path.join(ROOT, "public/images");
const AUDIO_DIR = path.join(ROOT, "public/audio");
fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(AUDIO_DIR, { recursive: true });

// troca {davi} / {golias} pela descrição fixa do personagem, pra manter consistência visual entre cenas
function resolvePrompt(promptImagem) {
  let resolved = promptImagem
    .replaceAll("{davi}", roteiro.personagens.davi)
    .replaceAll("{golias}", roteiro.personagens.golias);
  return `${resolved}. ${roteiro.estiloVisual}`;
}

async function gerarImagem(cena) {
  const prompt = resolvePrompt(cena.promptImagem);
  console.log(`[imagem] cena ${cena.id}: gerando...`);

  const params = new URLSearchParams({
    width: "1024",
    height: "1536",
    nologo: "true",
    model: "flux",
  });
  if (POLLINATIONS_TOKEN) params.set("token", POLLINATIONS_TOKEN);

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
  const resp = await fetch(url);

  if (!resp.ok) {
    throw new Error(`Erro ao gerar imagem da cena ${cena.id}: ${resp.status} ${await resp.text()}`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  const filePath = path.join(IMG_DIR, `${cena.id}.png`);
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
  console.log(`[imagem] cena ${cena.id}: salva em public/images/${cena.id}.png`);
}

async function gerarNarracao(cena) {
  console.log(`[audio] cena ${cena.id}: gerando narração...`);

  const headers = { "Content-Type": "application/json" };
  if (POLLINATIONS_TOKEN) headers["Authorization"] = `Bearer ${POLLINATIONS_TOKEN}`;

  const resp = await fetch("https://gen.pollinations.ai/v1/audio/speech", {
    method: "POST",
    headers,
    body: JSON.stringify({
      input: cena.narracao,
      voice: VOICE,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Erro ao gerar narração da cena ${cena.id}: ${resp.status} ${await resp.text()}`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  const filePath = path.join(AUDIO_DIR, `${cena.id}.mp3`);
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
  console.log(`[audio] cena ${cena.id}: salva em public/audio/${cena.id}.mp3`);

  const durationOutput = execSync(
    `ffprobe -v error -show_entries format=duration -of csv=p=0 "${filePath}"`
  ).toString().trim();
  const durationSeconds = parseFloat(durationOutput);

  return durationSeconds;
}

async function main() {
  const manifestCenas = [];

  for (const cena of roteiro.cenas) {
    await gerarImagem(cena);
    await new Promise((r) => setTimeout(r, 2000));
    const durationSeconds = await gerarNarracao(cena);
    await new Promise((r) => setTimeout(r, 2000));

    manifestCenas.push({
      id: cena.id,
      narracao: cena.narracao,
      image: `images/${cena.id}.png`,
      audio: `audio/${cena.id}.mp3`,
      durationSeconds: durationSeconds + 0.6,
    });
  }

  const manifest = {
    episodio: roteiro.episodio,
    fps: 30,
    cenas: manifestCenas,
  };

  fs.writeFileSync(
    path.join(ROOT, "public/manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log("\nmanifest.json gerado com sucesso. Total de cenas:", manifestCenas.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
