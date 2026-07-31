import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import manifest from "../public/manifest.json";

type Cena = {
  id: string;
  narracao: string;
  image: string;
  audio: string;
  durationSeconds: number;
};

const Cena: React.FC<{ cena: Cena; durationInFrames: number }> = ({
  cena,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // efeito Ken Burns: zoom lento contínuo na imagem
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  // legenda entra suave e sai suave
  const captionOpacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile(cena.audio)} />
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile(cena.image)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* vinheta escura pra legenda ficar legível */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 30%)",
        }}
      />

      {/* barras de cinema */}
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: "#000" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "#000" }} />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 40,
          right: 40,
          textAlign: "center",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.4,
          textShadow: "0 4px 12px rgba(0,0,0,0.9)",
          opacity: captionOpacity,
        }}
      >
        {cena.narracao}
      </div>
    </AbsoluteFill>
  );
};

export const MyVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  let startFrame = 0;

  return (
    <AbsoluteFill>
      {manifest.cenas.map((cena) => {
        const durationInFrames = Math.round(cena.durationSeconds * fps);
        const from = startFrame;
        startFrame += durationInFrames;

        return (
          <Sequence key={cena.id} from={from} durationInFrames={durationInFrames}>
            <Cena cena={cena} durationInFrames={durationInFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
