const Theme = {
  breakpoints: {
    s: '0px',
    md: '700px',
    lg: '1025px',
    xlg: '1536px',
  },
  spacing: (multiple: number) => multiple * 2,
  radius: (multiple: number) => multiple * 4 + 4,

  /*
   * Colors from UI Revamp here:
   * ref: https://zeroheight.com/0683c9fa7/p/606387-colors
   */
  colors: {
    white_0: '#FFFFFF',
    white_200: 'rgba(255, 255, 255, 0.8)',
    white_400: 'rgba(255, 255, 255, 0.6)',
    white_600: 'rgba(255, 255, 255, 0.2)',
    white_800: 'rgba(255, 255, 255, 0.20)',
    white_850: 'rgba(255, 255, 255, 0.15)',
    white_900: 'rgba(255, 255, 255, 0.1)',

    elevation_n1: '#0C0C0C',
    elevation0: '#181818',
    elevation1: '#1E2024',
    elevation2: '#24282F',
    elevation3: '#2A2F39',
    elevation5: '#303643',
    elevation6: '#4C525F',
    elevation6_600: 'rgba(76, 82, 95, 0.4)',
    elevation6_800: 'rgba(76, 82, 95, 0.2)',
    elevation8: '#7A7688',

    // feedback
    danger_light: '#FF5A5A',
    danger_medium: '#EA4848',
    danger_dark: '#AB3030',
    danger_dark_100: 'rgba(171, 48, 48, 0.9)',
    danger_dark_200: 'rgba(171, 48, 48, 0.8)',
    danger_dark_600: 'rgba(171, 48, 48, 0.4)',
    success_light: '#55E078',
    success_medium: '#55B86E',
    caution: '#F2A900',

    // brand
    emerald_light: '#55B86E',
    emerald: '#49A15F',
    emerald_dark: '#3E8A51',
    tangerine_light: '#EF883B',
    tangerine: '#EE7A30',
    tangerine_dark: '#D96F2A',
    lilac_light: '#6E54CB',
    lilac: '#5E41C5',
    lilac_dark: '#4F34BA',

    background: {
      modalBackdrop: 'rgba(18,21,30,0.6)',
      modalBackdrop2: 'rgba(18, 21, 30, 0.90)',
      selectBackground:
        'linear-gradient(0deg, rgba(115, 131, 255, 0.05), rgba(115, 131, 255, 0.05)), #1D2032',
    },

    feedback: {
      /**
       * @deprecated use success_medium
       */
      success: '#55B86E',
      /**
       * @deprecated use danger_medium
       */
      error: '#EA4848',

      /**
       * @deprecated use danger_dark_600
       */
      error_700: 'rgba(171, 48, 48, 0.4)',
    },

    /**
     * @deprecated
     */
    action: {
      classic: '#FFFFFF',
      classicLight: 'rgba(255, 255, 255, 0.85)',
      classic800: 'rgba(85, 101, 247, 0.2)',
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
     * @deprecated use lilac
     */
    purple_main: '#5E41C5',

    /**
     * @deprecated use tangerine
     */
    orange_main: ' #EE7A30',
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

  // TODO tim: grep codebase and remove all
  /* deprecated: below */
  headline_category_m: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 0.02,
    textTransform: 'uppercase',
  },
  headline_category_s: {
    fontFamily: 'DMSans-Medium',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.02,
  },
  body_bold_l: {
    fontFamily: 'DMSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 16,
  },
  body_medium_l: {
    fontFamily: 'DMSans-Regular',
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
  body_xs: {
    fontFamily: 'DMSans-Regular',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
  },
  headline_xl: {
    fontFamily: 'IBMPlexSans-Regular',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 42,
    letterSpacing: 0.02,
  },
  tile_text: {
    fontFamily: 'Satoshi-Regular',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.02,
  },
  bold_tile_text: {
    fontFamily: 'Satoshi-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.02,
  },
  headline_l: {
    fontFamily: 'IBMPlexSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 34,
    letterSpacing: 0.02,
  },
  headline_m: {
    fontFamily: 'IBMPlexSans-Bold',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 24,
    letterSpacing: 0.02,
  },
  headline_s: {
    fontFamily: 'IBMPlexSans-Medium',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 21,
    letterSpacing: 0.02,
  },
  /* above: deprecated */
};
export default Theme;
