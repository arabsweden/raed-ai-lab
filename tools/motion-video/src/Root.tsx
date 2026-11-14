import { Composition } from "remotion";
import { Video, VideoProps } from "./Video";
import { DURATION, FPS, H, W } from "./theme";

// لإضافة الفويس أوفر: ضع الملف في public/voiceover.wav وغيّر voiceover إلى "voiceover.wav"
const defaults: VideoProps = { voiceover: null, sfx: true };

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
