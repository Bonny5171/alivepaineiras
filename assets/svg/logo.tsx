import React, { FC } from 'react';
import Svg, { Circle, Path, SvgProps } from 'react-native-svg';

const Logo: FC<SvgProps> = ({ width = 117, height = 117 }) => (
  <Svg width={width} height={height} viewBox="0 0 117 116" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M47.7321 90.6709L58.3777 66.1983L69.0232 90.6709L90.192 95.1983L85.5422 74.519L63.1498 65.7089H88.6013L108.424 45.519H77.0992L61.3143 60.5696L74.8966 25.5738L58.3777 8.56543L41.8587 25.5739L55.4409 60.5696L39.6561 45.519H8.33124L28.154 65.7089H53.6055L31.2131 74.519L26.5633 95.1983L47.7321 90.6709ZM59.702 28.0077C60.5917 27.5031 61.192 26.5474 61.192 25.4515C61.192 23.8296 59.8772 22.5148 58.2553 22.5148C56.6334 22.5148 55.3186 23.8296 55.3186 25.4515C55.3186 26.5474 55.9189 27.5031 56.8086 28.0077L58.2553 43.4388L59.702 28.0077Z"
      fill="#ED008C"
    />
    <Circle
      cx="58.5"
      cy="58"
      r="55.7975"
      stroke="#ED008C"
      strokeWidth="4.40506"
    />
  </Svg>
);

export default Logo;
