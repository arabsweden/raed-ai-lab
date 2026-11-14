import { Composition } from "remotion";
import { Video, VideoProps } from "./Video";
import { DURATION, FPS, H, W } from "./theme";

// الفويس أوفر في public/voiceover.wav (اجعله null لنسخة بدون صوت)
const defaults: VideoProps = { voiceover: "voiceover.wav", sfx: true };

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Raed7Motion"
      component={Video}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={defaults}
    />
  );
};
