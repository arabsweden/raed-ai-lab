import React from "react";
import { Composition } from "remotion";
import { Scene1, FPS, DURATION } from "./Scene1";
import { Film, FILM_FRAMES } from "./Film";
import { Cover, GCover, MCover } from "./Cover";
import { GFilm, G_FRAMES } from "./GFilm";
import { MFilm, M_FRAMES } from "./MFilm";
export const RemotionRoot: React.FC = () => (<>
  <Composition id="Scene1" component={Scene1} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} />
  <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={FPS} width={1080} height={1920} />
  <Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  <Composition id="Goteborg" component={GFilm} durationInFrames={G_FRAMES} fps={FPS} width={1080} height={1920} />
  <Composition id="GCover" component={GCover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
  <Composition id="Malmo" component={MFilm} durationInFrames={M_FRAMES} fps={FPS} width={1080} height={1920} />
  <Composition id="MCover" component={MCover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
</>);
