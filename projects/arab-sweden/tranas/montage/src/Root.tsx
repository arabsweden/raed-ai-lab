import React from "react";
import {Composition} from "remotion";
import {Cover} from "./Cover";
import {TOTAL_FRAMES, Tranas} from "./Tranas";
import {FPS} from "./theme";

export const Root: React.FC = () => (
	<>
		<Composition id="Tranas" component={Tranas} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
		<Composition id="Cover" component={Cover} durationInFrames={1} fps={FPS} width={1080} height={1920} />
	</>
);
