import React from "react";
import { Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import manifest from "../public/manifest.json";

const FPS = manifest.fps ?? 30;
const TRANSITION_FRAMES = 15;

const totalSecondsCenas = manifest.cenas.reduce(
  (acc, c) => acc + c.durationSeconds,
  0
);
const totalFramesCenas = Math.round(totalSecondsCenas * FPS);
const totalFrames =
  totalFramesCenas - (manifest.cenas.length - 1) * TRANSITION_FRAMES;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DaviGolias"
      component={MyVideo}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
