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
    success: '#51D6A6',
    caution: '#F2A900',
    error: '#D33C3C',
    error_700: 'rgba(211, 60, 60, 0.3)',

    // TODO tim: grep codebase and remove all
    /* deprecated: below */
    action: {
      classic: '#FFFFFF',
      classicLight: 'rgba(255, 255, 255, 0.85)',
      classic800: 'rgba(85, 101, 247, 0.2)',
    },
    background: {
      modalBackdrop: 'rgba(18,21,30,0.6)',
      modalBackdrop2: 'rgba(18, 21, 30, 0.90)',
      selectBackground:
        'linear-gradient(0deg, rgba(115, 131, 255, 0.05), rgba(115, 131, 255, 0.05)), #1D2032',
    },
    border: {
      select: 'rgba(115, 131, 255, 0.4)',
    },
    grey: '#24252C',
    purple_main: '#5E41C5',
    orange_main: ' #EE7A30',
    /* above: deprecated */
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
