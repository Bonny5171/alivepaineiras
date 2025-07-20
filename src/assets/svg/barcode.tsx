import React, { FC } from 'react';
import Svg, { Rect } from 'react-native-svg';

const Barcode: FC<SvgProps> = ({ width = 233, height = 48 }) => (
  <Svg width={width} height={height} viewBox="0 0 233 48" fill="none">
    <Rect x="0.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="8.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="15.5" width="4" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="22.5" width="6" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="32.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="39.5" width="4" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="47.5" width="4" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="56.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="61.5" width="7" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="71.5" width="3" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="79.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="87.5" width="3" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="93.5" width="7" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="103.5" width="3" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="111.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="119.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="125.5" width="5" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="134.5" width="4" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="141.5" width="6" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="151.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="156.5" width="7" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="167.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="172.5" width="7" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="182.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="189.5" width="4" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="197.5" width="5" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="204.5" width="7" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="213.5" width="4" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="222.5" width="2" height="48" fill="white" fillOpacity="0.6" />
    <Rect x="230.5" width="2" height="48" fill="white" fillOpacity="0.6" />
  </Svg>
);

export default Barcode;
