export const breakpoints = {
  xs: '376',
  s: '480',
  md: '768',
  lg: '920',
  xl: '1200',
};

export const devices = {
  min: {
    xs: `(min-width: ${breakpoints.xs}px)`,
    s: `(min-width: ${breakpoints.s}px)`,
    md: `(min-width: ${breakpoints.md}px)`,
    lg: `(min-width: ${breakpoints.lg}px)`,
    xl: `(min-width: ${breakpoints.xl}px)`,
  },
  max: {
    xs: `(max-width: ${breakpoints.xs}px)`,
    s: `(max-width: ${breakpoints.s}px)`,
    md: `(max-width: ${breakpoints.md}px)`,
    lg: `(max-width: ${breakpoints.lg}px)`,
    xl: `(max-width: ${breakpoints.xl}px)`,
  },
};

const Theme = {
  /**
   * @deprecated use theme.space object
   */
  spacing: (multiple: number) => multiple * 2,
  space: {
    xxxs: '2px',
    xxs: '4px',
    xs: '8px',
    s: '12px',
    m: '16px',
    ml: '20px',
    l: '24px',
    xl: '32px',
    xxl: '40px',
    xxxl: '64px',
    xxxxl: '80px',
  } as const,
  radius: (multiple: number) => multiple * 4 + 4,

  /*
   * Colors from UI Revamp here:
   * ref: https://zeroheight.com/0683c9fa7/p/606387-colors
   */
  colors: {
    white_0: '#FFFFFF',
    white_200: 'rgba(255, 255, 255, 0.8)',
    white_400: 'rgba(255, 255, 255, 0.6)',
    white_600: 'rgba(255, 255, 255, 0.4)',
    white_800: 'rgba(255, 255, 255, 0.2)',
    white_850: 'rgba(255, 255, 255, 0.15)',
    white_900: 'rgba(255, 255, 255, 0.1)',
    white_950: 'rgba(255, 255, 255, 0.05)',

    red_0: '#F00',

    elevation_n1: '#0C0C0C',
    elevation0: '#181818',
    elevation1: '#1A1A1A',
    elevation2: '#1F1F1F',
    elevation3: '#2A2F39',
    elevation5: '#303643',
    elevation6: '#4C525F',
    elevation6_400: 'rgba(76, 82, 95, 0.6)',
    elevation6_600: 'rgba(76, 82, 95, 0.4)',
    elevation6_800: 'rgba(76, 82, 95, 0.2)',
    elevation8: '#7A7688',

    // feedback
    danger_light: '#FF5A5A',
    danger_medium: '#EA4848',
    danger_dark: '#AB3030',
    danger_dark_100: 'rgba(171, 48, 48, 0.9)',
    danger_dark_200: 'rgba(171, 48, 48, 0.8)',
    danger_dark_400: 'rgba(171, 48, 48, 0.6)',
    danger_dark_600: 'rgba(171, 48, 48, 0.4)',
    success_light: '#55E078',
    success_medium: '#55B86E',
    success_dark: '#3B884E',
    success_dark_600: 'rgba(59,136,78,0.4)',
    caution: '#F2A900',
    caution_800: 'rgba(242, 169, 0, 0.2)',

    // brand
    emerald_light: '#55B86E',
    emerald: '#49A15F',
    emerald_dark: '#3E8A51',
    tangerine_light: '#EF883B',
    tangerine_dark: '#D96F2A',
    tangerine: '#EE7A30',
    tangerine_200: 'rgba(238,122,48,0.8)',
    tangerine_400: 'rgba(238,122,48,0.6)',
    lilac_light: '#6E54CB',
    lilac: '#5E41C5',
    lilac_dark: '#4F34BA',

    // utility
    transparent: 'rgba(0, 0, 0, 0)',

    action: {
      /**
       * @deprecated
       */
      classic: '#FFFFFF',

      /**
       * @deprecated
       */
      classicLight: 'rgba(255, 255, 255, 0.85)',

      /**
       * @deprecated
       */
      classic800: 'rgba(85, 101, 247, 0.2)',
    },
    white: {
      /**
       * @deprecated use theme.colors.white_0
       */
      0: '#FFFFFF',

      /**
       * @deprecated use theme.colors.white_200
       */
      200: 'rgba(255, 255, 255, 0.8)',

      /**
       * @deprecated use theme.colors.white_400
       */
      400: 'rgba(255, 255, 255, 0.6)',

      /**
       * @deprecated use theme.colors.white_600
       */
      600: 'rgba(255, 255, 255, 0.4)',

      /**
       * @deprecated use theme.colors.white_800
       */
      800: 'rgba(255, 255, 255, 0.2)',

      /**
       * @deprecated use theme.colors.white_850
       */
      850: 'rgba(255, 255, 255, 0.15)',

      /**
       * @deprecated use theme.colors.white_900
       */
      900: 'rgba(255, 255, 255, 0.1)',
    },
    background: {
      /**
       * @deprecated use theme.colors.elevation
       */
      elevation_n1: '#0C0C0C',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation0: '#181818',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation1: '#1E2024',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation_1: '#1E2024',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation2: '#24282F',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation3: '#2A2F39',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation5: '#303643',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation6: '#4C525F',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation6_600: 'rgba(76, 82, 95, 0.4)',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation6_800: 'rgba(76, 82, 95, 0.2)',

      /**
       * @deprecated use theme.colors.elevation
       */
      elevation8: '#7A7688',

      /**
       * @deprecated
       */
      elevation9: 'rgba(76, 81, 135, 0.2)',

      /**
       * @deprecated
       */
      elevation10: 'rgba(76, 81, 135, 0.35)',

      modalBackdrop: 'rgba(24, 24, 24, 0.80)',
      modalBackdrop2: 'rgba(18, 21, 30, 0.90)',
      selectBackground:
        'linear-gradient(0deg, rgba(115, 131, 255, 0.05), rgba(115, 131, 255, 0.05)), #1D2032',
    },

    /**
     * @deprecated
     */
    border: {
      select: 'rgba(115, 131, 255, 0.4)',
    },

    /**
     * @deprecated
     */
    grey: '#24252C',

    /**
     * @deprecated use `lilac`
     */
    purple_main: '#5E41C5',

    /**
     * @deprecated use `tangerine`
     */
    orange_main: '#EE7A30',
  },

  /*
   * Typography from UI Revamp here:
   * ref: https://zeroheight.com/0683c9fa7/p/789eec-typography
   *
   * Usage:
   *   import { StyledP, StyledHeading } from '@components/common.styled';
   *
   *   <StyledHeading typography="headling_l">My heading</StyledHeading>
   *   <StyledP typography="body_m">My paragraph text</StyledP>
   *
   */
  typography: {
    headline_xl: {
      fontFamily: 'IBMPlexSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 40,
      letterSpacing: 0.02,
      lineHeight: '125%',
    },
    headline_l: {
      fontFamily: 'IBMPlexSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 34,
      letterSpacing: 0.02,
      lineHeight: '125%',
    },
    headline_m: {
      fontFamily: 'IBMPlexSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 28,
      letterSpacing: 0.02,
      lineHeight: '140%',
    },
    headline_s: {
      fontFamily: 'IBMPlexSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 24,
      letterSpacing: 0.02,
      lineHeight: '140%',
    },
    headline_xs: {
      fontFamily: 'IBMPlexSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 20,
      letterSpacing: 0.02,
      lineHeight: '125%',
    },
    body_bold_l: {
      fontFamily: 'DMSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 16,
    },
    body_medium_l: {
      fontFamily: 'DMSans-Medium',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 16,
    },
    body_l: {
      fontFamily: 'DMSans-Regular',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 16,
    },
    body_bold_m: {
      fontFamily: 'DMSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 14,
    },
    body_medium_m: {
      fontFamily: 'DMSans-Medium',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 14,
    },
    body_m: {
      fontFamily: 'DMSans-Regular',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 14,
    },
    body_bold_s: {
      fontFamily: 'DMSans-Bold',
      fontStyle: 'normal',
      fontWeight: '700',
      fontSize: 12,
    },
    body_medium_s: {
      fontFamily: 'DMSans-Medium',
      fontStyle: 'normal',
      fontWeight: '500',
      fontSize: 12,
    },
    body_s: {
      fontFamily: 'DMSans-Regular',
      fontStyle: 'normal',
      fontWeight: '400',
      fontSize: 12,
    },
  },
  // css utils
  scrollbar: {
    scrollbarGutter: 'stable both-edges',
    'overflow-y': 'hidden',
    ':hover': {
      'overflow-y': 'auto',
    },
    '::-webkit-scrollbar': {
      display: 'block',
      width: 8,
      background: 'rgba(255, 255, 255, 0.10)',
    },
    '::-webkit-scrollbar-thumb': {
      width: 8,
      maxHeight: 10,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.2)',
    },
  },
  /**
   * @deprecated use theme.typography
   */
  headline_category_m: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 0.02,
  },

  /**
   * @deprecated use theme.typography
   */
  headline_category_s: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.02,
  },

  /**
   * @deprecated use theme.typography
   */
  body_bold_l: {
    fontFamily: 'DMSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
  },

  /**
   * @deprecated use theme.typography
   */
  body_medium_l: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
  },

  /**
   * @deprecated use theme.typography
   */
  body_l: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 16,
  },

  /**
   * @deprecated use theme.typography
   */
  body_bold_m: {
    fontFamily: 'DMSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 14,
  },

  /**
   * @deprecated use theme.typography
   */
  body_medium_m: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
  },

  /**
   * @deprecated use theme.typography
   */
  body_m: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
  },

  /**
   * @deprecated use theme.typography
   */
  body_medium_s: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 12,
  },

  /**
   * @deprecated use theme.typography
   */
  body_s: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
  },

  /**
   * @deprecated use theme.typography.body_s
   */
  body_xs: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
  },

  /**
   * @deprecated use theme.typography
   */
  headline_xl: {
    fontFamily: 'IBMPlexSans-Regular',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 42,
    letterSpacing: 0.02,
  },

  /**
   * @deprecated use theme.typography
   */
  tile_text: {
    fontFamily: 'Satoshi-Regular',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.02,
  },

  /**
   * @deprecated use theme.typography
   */
  bold_tile_text: {
    fontFamily: 'Satoshi-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.02,
  },

  /**
   * @deprecated use theme.typography
   */
  headline_l: {
    fontFamily: 'IBMPlexSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    letterSpacing: 0.02,
  },

  /**
   * @deprecated use theme.typography
   */
  headline_m: {
    fontFamily: 'IBMPlexSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: 0.02,
  },

  /**
   * @deprecated use theme.typography
   */
  headline_s: {
    fontFamily: 'IBMPlexSans-Medium',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 21,
    letterSpacing: 0.02,
  },
};

export type Color = keyof typeof Theme.colors | 'currentColor';
export type Typography = keyof typeof Theme.typography;

export default Theme;
