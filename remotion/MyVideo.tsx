import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import manifest from "../public/manifest.json";

const TRANSITION_FRAMES = 15;

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

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateRight: "clamp",
  });

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

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 30%)",
        }}
      />

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

  return (
    <AbsoluteFill>
      {manifest.temMusica && (
        <Audio src={staticFile("music/trilha.mp3")} loop volume={0.15} />
      )}

      <TransitionSeries>
        {manifest.cenas.map((cena, index) => {
          const durationInFrames = Math.round(cena.durationSeconds * fps);
          const isLast = index === manifest.cenas.length - 1;

          return (
            <React.Fragment key={cena.id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <Cena cena={cena} durationInFrames={durationInFrames} />
              </TransitionSeries.Sequence>
              {!isLast && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
