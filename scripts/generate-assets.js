import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { Communicate } from "edge-tts-universal";

const ROOT = path.resolve(import.meta.dirname, "..");
const roteiro = JSON.parse(fs.readFileSync(path.join(ROOT, "data/roteiro.json"), "utf-8"));

const POLLINATIONS_TOKEN = process.env.POLLINATIONS_TOKEN || "";
const VOICE = process.env.NARRATION_VOICE || "pt-BR-AntonioNeural";

const IMG_DIR = path.join(ROOT, "public/images");
const AUDIO_DIR = path.join(ROOT, "public/audio");
fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(AUDIO_DIR, { recursive: true });

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
    enhance: "true",
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

  const communicate = new Communicate(cena.narracao, { voice: VOICE });
  const buffers = [];

  for await (const chunk of communicate.stream()) {
    if (chunk.type === "audio" && chunk.data) {
      buffers.push(chunk.data);
    }
  }

  const finalBuffer = Buffer.concat(buffers);
  const filePath = path.join(AUDIO_DIR, `${cena.id}.mp3`);
  fs.writeFileSync(filePath, finalBuffer);
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

    manifestCenas.push({
      id: cena.id,
      narracao: cena.narracao,
      image: `images/${cena.id}.png`,
      audio: `audio/${cena.id}.mp3`,
      durationSeconds: durationSeconds + 0.6,
    });
  }

  const musicaPath = path.join(ROOT, "public/music/trilha.mp3");
  const temMusica = fs.existsSync(musicaPath);
  if (temMusica) {
    console.log("\n[música] trilha.mp3 encontrada — vai entrar no vídeo.");
  } else {
    console.log("\n[música] nenhuma trilha encontrada em public/music/trilha.mp3 — vídeo sairá sem música de fundo.");
  }

  const manifest = {
    episodio: roteiro.episodio,
    fps: 30,
    temMusica,
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
