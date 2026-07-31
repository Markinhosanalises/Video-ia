import React from "react";
import { Composition } from "remotion";
import { MyVideo } from "./MyVideo";
import manifest from "../public/manifest.json";

const FPS = manifest.fps ?? 30;
const totalSeconds = manifest.cenas.reduce(
  (acc, c) => acc + c.durationSeconds,
  0
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="DaviGolias"
      component={MyVideo}
      durationInFrames={Math.round(totalSeconds * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
