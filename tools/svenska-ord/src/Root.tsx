import { CalculateMetadataFunction, Composition, Folder } from "remotion";
import words from "../words.json";
import {
  compositionId,
  FPS,
  HEIGHT,
  svenskaOrdSchema,
  SvenskaOrdProps,
  toEpisodeProps,
  WIDTH,
  WordsFile,
} from "./schema";
import { SvenskaOrd } from "./SvenskaOrd";

const file = words as WordsFile;

// Duration and output file name follow the (editable) props.
const calculateMetadata: CalculateMetadataFunction<SvenskaOrdProps> = ({
  props,
}) => ({
  durationInFrames: Math.round(props.durationInSeconds * FPS),
  defaultOutName: `svenska-ord-${String(props.episode).padStart(2, "0")}-${props.swedishWord.toLowerCase()}`,
});

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Svenska-Ord">
      {file.episodes.map((entry, index) => {
        const props = toEpisodeProps(file, entry, index);
        return (
          <Composition
            key={entry.id}
            id={compositionId(entry.id, props.episode)}
            component={SvenskaOrd}
            schema={svenskaOrdSchema}
            durationInFrames={Math.round(props.durationInSeconds * FPS)}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={props}
            calculateMetadata={calculateMetadata}
          />
        );
      })}
    </Folder>
  );
};
