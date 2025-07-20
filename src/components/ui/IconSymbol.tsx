import React from 'react';
// import {
//   Ionicons,
//   FontAwesome6,
//   MaterialIcons,
//   MaterialCommunityIcons,
// } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCircleUser,
  faCourtSport,
  faForkKnife,
  faGoalNet,
  faGrillHot,
  faPeopleRoof,
  faSchoolFlag,
  faWaterLadder,
  IconDefinition as IconDefinitionSolid
} from '@fortawesome/pro-solid-svg-icons';
import {
  faStretcher,
  faPool8Ball,
  faMasksTheater,
  faSackDollar,
  faUserTie,
  faFerrisWheel,
  faUserDoctor,
  faUserHeadset,
  faMoneySimpleFromBracket,
  faGamepadModern,
  faBookOpenCover,
  faOliveBranch,
  faGlassCitrus,
  faCartShopping,
  faSuitcaseRolling,
  faBottleDroplet,
  faHatChef,
  faCarWash,
  faBowlChopsticksNoodles,
  faBurgerSoda,
  faTeddyBear,
  faWineBottle,
  faMugHot,
  faWatchFitness,
  faUmbrellaBeach,
  faBoxingGlove,
  faUniformMartialArts,
  faPersonSnowboarding,
  faTableTennisPaddleBall,
  faPersonRunning,
  faWandMagicSparkles,
  faWebAwesome,
  faMicrophoneStand,
  faMugSaucer,
  faUserMusic,
  faHandsHoldingCircle,
  faTentDoublePeak,
  faYinYang,
  faPianoKeyboard,
  IconDefinition as IconDefinitionRegular
} from '@fortawesome/pro-regular-svg-icons';
import {
  IconDefinition as IconDefinitionLight
} from '@fortawesome/pro-light-svg-icons';
import {
  IconDefinition as IconDefinitionDuotone
} from '@fortawesome/pro-duotone-svg-icons';
import * as RegularIcons from '@fortawesome/pro-regular-svg-icons';
import * as SolidIcons from '@fortawesome/pro-solid-svg-icons';
import * as LightIcons from '@fortawesome/pro-light-svg-icons';
import * as DuotoneIcons from '@fortawesome/pro-duotone-svg-icons';
faStretcher

type IconLibrary = 'material' | 'fontawesome' | 'ionicons' | 'materialCommunity';
type FontAwesomeStyle = 'solid' | 'regular' | 'light' | 'duotone';

type IconSymbolProps = {
  name:
  | React.ComponentProps<typeof MaterialIcons>['name']
  | React.ComponentProps<typeof FontAwesome6>['name']
  | IconDefinitionSolid
  | IconDefinitionRegular
  | IconDefinitionLight
  | IconDefinitionDuotone;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  library?: IconLibrary;
  faStyle?: FontAwesomeStyle;
};

// Mapeamento manual de ícones prioritários (apenas nomes)
const manualIcons: Record<string, string> = {
  stretcher: 'faStretcher',
  faStretcher: 'faStretcher',
  'fa-stretcher': 'faStretcher',
  pool8ball: 'faPool8Ball',
  faPool8Ball: 'faPool8Ball',
  'fa-pool-8-ball': 'faPool8Ball',
  'pool-8-ball': 'faPool8Ball',
  masksTheater: 'faMasksTheater',
  faMasksTheater: 'faMasksTheater',
  'fa-masks-theater': 'faMasksTheater',
  sackDollar: 'faSackDollar',
  faSackDollar: 'faSackDollar',
  'fa-sack-dollar': 'faSackDollar',
  userTie: 'faUserTie',
  faUserTie: 'faUserTie',
  'fa-user-tie': 'faUserTie',
  ferrisWheel: 'faFerrisWheel',
  faFerrisWheel: 'faFerrisWheel',
  'fa-ferris-wheel': 'faFerrisWheel',
  userDoctor: 'faUserDoctor',
  faUserDoctor: 'faUserDoctor',
  'fa-user-doctor': 'faUserDoctor',
  userHeadset: 'faUserHeadset',
  faUserHeadset: 'faUserHeadset',
  'fa-user-headset': 'faUserHeadset',
  moneySimpleFromBracket: 'faMoneySimpleFromBracket',
  faMoneySimpleFromBracket: 'faMoneySimpleFromBracket',
  'fa-money-simple-from-bracket': 'faMoneySimpleFromBracket',
  gamepadModern: 'faGamepadModern',
  faGamepadModern: 'faGamepadModern',
  'fa-gamepad-modern': 'faGamepadModern',
  bookOpenCover: 'faBookOpenCover',
  faBookOpenCover: 'faBookOpenCover',
  'fa-book-open-cover': 'faBookOpenCover',
  oliveBranch: 'faOliveBranch',
  faOliveBranch: 'faOliveBranch',
  'fa-olive-branch': 'faOliveBranch',
  glassCitrus: 'faGlassCitrus',
  faGlassCitrus: 'faGlassCitrus',
  'fa-glass-citrus': 'faGlassCitrus',
  cartShopping: 'faCartShopping',
  faCartShopping: 'faCartShopping',
  'fa-cart-shopping': 'faCartShopping',
  suitcaseRolling: 'faSuitcaseRolling',
  faSuitcaseRolling: 'faSuitcaseRolling',
  'fa-suitcase-rolling': 'faSuitcaseRolling',
  bottleDroplet: 'faBottleDroplet',
  faBottleDroplet: 'faBottleDroplet',
  'fa-bottle-droplet': 'faBottleDroplet',
  hatChef: 'faHatChef',
  faHatChef: 'faHatChef',
  'fa-hat-chef': 'faHatChef',
  carWash: 'faCarWash',
  faCarWash: 'faCarWash',
  'fa-car-wash': 'faCarWash',
  bowlChopsticksNoodles: 'faBowlChopsticksNoodles',
  faBowlChopsticksNoodles: 'faBowlChopsticksNoodles',
  'fa-bowl-chopsticks-noodles': 'faBowlChopsticksNoodles',
  burgerSoda: 'faBurgerSoda',
  faBurgerSoda: 'faBurgerSoda',
  'fa-burger-soda': 'faBurgerSoda',
  teddyBear: 'faTeddyBear',
  faTeddyBear: 'faTeddyBear',
  'fa-teddy-bear': 'faTeddyBear',
  wineBottle: 'faWineBottle',
  faWineBottle: 'faWineBottle',
  'fa-wine-bottle': 'faWineBottle',
  mugHot: 'faMugHot',
  faMugHot: 'faMugHot',
  'fa-mug-hot': 'faMugHot',
  watchFitness: 'faWatchFitness',
  faWatchFitness: 'faWatchFitness',
  'fa-watch-fitness': 'faWatchFitness',
  umbrellaBeach: 'faUmbrellaBeach',
  faUmbrellaBeach: 'faUmbrellaBeach',
  'fa-umbrella-beach': 'faUmbrellaBeach',
  boxingGlove: 'faBoxingGlove',
  faBoxingGlove: 'faBoxingGlove',
  'fa-boxing-glove': 'faBoxingGlove',
  uniformMartialArts: 'faUniformMartialArts',
  faUniformMartialArts: 'faUniformMartialArts',
  'fa-uniform-martial-arts': 'faUniformMartialArts',
  personSnowboarding: 'faPersonSnowboarding',
  faPersonSnowboarding: 'faPersonSnowboarding',
  'fa-person-snowboarding': 'faPersonSnowboarding',
  tableTennisPaddleBall: 'faTableTennisPaddleBall',
  faTableTennisPaddleBall: 'faTableTennisPaddleBall',
  'fa-table-tennis-paddle-ball': 'faTableTennisPaddleBall',
  personRunning: 'faPersonRunning',
  faPersonRunning: 'faPersonRunning',
  'fa-person-running': 'faPersonRunning',
  wandMagicSparkles: 'faWandMagicSparkles',
  faWandMagicSparkles: 'faWandMagicSparkles',
  'fa-wand-magic-sparkles': 'faWandMagicSparkles',
  webAwesome: 'faWebAwesome',
  faWebAwesome: 'faWebAwesome',
  'fa-web-awesome': 'faWebAwesome',
  microphoneStand: 'faMicrophoneStand',
  faMicrophoneStand: 'faMicrophoneStand',
  'fa-microphone-stand': 'faMicrophoneStand',
  mugSaucer: 'faMugSaucer',
  faMugSaucer: 'faMugSaucer',
  'fa-mug-saucer': 'faMugSaucer',
  userMusic: 'faUserMusic',
  faUserMusic: 'faUserMusic',
  'fa-user-music': 'faUserMusic',
  handsHoldingCircle: 'faHandsHoldingCircle',
  faHandsHoldingCircle: 'faHandsHoldingCircle',
  'fa-hands-holding-circle': 'faHandsHoldingCircle',
  tentDoublePeak: 'faTentDoublePeak',
  faTentDoublePeak: 'faTentDoublePeak',
  'fa-tent-double-peak': 'faTentDoublePeak',
  yinYang: 'faYinYang',
  faYinYang: 'faYinYang',
  'fa-yin-yang': 'faYinYang',
  pianoKeyboard: 'faPianoKeyboard',
  faPianoKeyboard: 'faPianoKeyboard',
  'fa-piano-keyboard': 'faPianoKeyboard',
  goalNet: 'faGoalNet',
  faGoalNet: 'faGoalNet',
  'fa-goal-net': 'faGoalNet',
  waterLadder: 'faWaterLadder',
  faWaterLadder: 'faWaterLadder',
  'fa-water-ladder': 'faWaterLadder',
  schoolFlag: 'faSchoolFlag',
  faSchoolFlag: 'faSchoolFlag',
  'fa-school-flag': 'faSchoolFlag',
  forkKnife: 'faForkKnife',
  faForkKnife: 'faForkKnife',
  'fa-fork-knife': 'faForkKnife',
  grillHot: 'faGrillHot',
  faGrillHot: 'faGrillHot',
  'fa-grill-hot': 'faGrillHot',
  circleUser: 'faCircleUser',
  faCircleUser: 'faCircleUser',
  'fa-circle-user': 'faCircleUser',
  peopleRoof: 'faPeopleRoof',
  faPeopleRoof: 'faPeopleRoof',
  'fa-people-roof': 'faPeopleRoof',
  courtSport: 'faCourtSport',
  faCourtSport: 'faCourtSport',
  'fa-court-sport': 'faCourtSport',
  'fa-person-running-fast': 'faPersonRunningFast',
  'fa-tennis-ball': 'faTennisBall',
  'fa-water-arrow-up': 'faWaterArrowUp',
  'fa-person-ski-jumping': 'faPersonSkiJumping',
  'fa-brain-circuit': 'faBrainCircuit',
  'fa-transporter-3': 'faTransporter3',
  'fa-person-dolly-empty': 'faPersonDollyEmpty',
  'fa-basketball-hoop': 'faBasketballHoop',
  'fa-person-runnin': 'faPersonRunning',
  'help-circle': 'faIcicles',
  'fa-cheese-swiss': 'faCheese',
};

const iconSets = {
  solid: SolidIcons,
  regular: RegularIcons,
  light: LightIcons,
  duotone: DuotoneIcons,
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  library = 'fontawesome',
  faStyle = 'regular',
}: IconSymbolProps) {
  const vectorIcons = {
    material: MaterialIcons,
    ionicons: Ionicons,
    materialCommunity: MaterialCommunityIcons,
    fontawesome: FontAwesome6,
  };

  if (library === 'fontawesome' && typeof name === 'string') {
    const trimmedName = name.trim();
    // Busca na lista manual, mas pega do pacote do estilo
    const manualKey = manualIcons[trimmedName];
    if (manualKey) {
      const iconSet = iconSets[faStyle] as any;
      const icon = iconSet[manualKey];
      if (icon) {
        return (
          <FontAwesomeIcon
            icon={icon}
            size={size}
            color={color as string}
          />
        );
      }
    }
    // Permite passar tanto 'stretcher', 'faStretcher', 'fa-stretcher', 'face-smile', etc.
    let iconKey = trimmedName;
    if (iconKey.startsWith('fa-')) {
      iconKey = 'fa' + iconKey[3].toUpperCase() + iconKey.slice(4);
    } else if (iconKey.includes('-')) {
      iconKey = 'fa' + iconKey.split('-').map((part, i) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    } else if (!iconKey.startsWith('fa')) {
      iconKey = 'fa' + iconKey.charAt(0).toUpperCase() + iconKey.slice(1);
    }
    // Busca no pacote correto do estilo
    const iconSet = iconSets[faStyle] as any;
    if (iconSet && iconSet[iconKey]) {
      return (
        <FontAwesomeIcon
          icon={iconSet[iconKey]}
          size={size}
          color={color as string}
        />
      );
    }
    // fallback para o FontAwesome6 textual, caso não ache o ícone pro
    const fallbackName = trimmedName.replace(/^fa-/, '').replace(/^fa/, '').replace(/^./, c => c.toLowerCase());
    const IconComponent = vectorIcons[library];
    return <IconComponent name={fallbackName} size={size} color={color} style={style} />;
  }

  // Se a lib for FontAwesome oficial e o nome já for um IconDefinition
  if (library === 'fontawesome' && typeof name !== 'string') {
    return (
      <FontAwesomeIcon
        icon={name}
        size={size}
        color={color as string}
      />
    );
  }

  // Para todas as outras libs
  const IconComponent = vectorIcons[library];
  return <IconComponent name={name as string} size={size} color={color} style={style} />;
}