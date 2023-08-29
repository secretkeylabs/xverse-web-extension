import React, { useEffect } from 'react';
// import Animated, {
//   Easing,
//   withTiming,
//   useSharedValue,
//   useAnimatedStyle,
//   interpolate,
//   Extrapolation,
// } from 'react-native-reanimated';

import WalletSafeArea from '../../utils/walletSafeArea';
import PrimaryButton from '../primaryButton';
// import {getLocalizedString} from '../../utils/helper';

import { styles } from './styles';
import { CircularSvgAnimation } from './circularSvgAnimation';

export type ConfirmationStatus = 'SUCCESS' | 'FAILURE' | 'LOADING';

type Texts = {
  title: string;
  description: string;
};

type Action = {
  onPress: () => void;
  text: string;
};

interface LoadingTransactionStatusProps {
  status: ConfirmationStatus;
  resultTexts: Texts;
  loadingTexts: Texts;
  cancelAction: Action;
  successAction: Action;
  loadingProgress?: number;
}

const { height: screenHeight } = Dimensions.get('screen');

/**
 *
 * @param status - The status of the transaction (Loading, Success, Failure)
 * @param resultText - The text to display when the transaction is complete (Success or Failure)
 * @param loadingTexts - The text to display when the transaction is loading
 * @param cancelAction - The first action to display (text and onPress)
 * @param successAction - The second action to display (text and onPress)
 * @param loadingProgress - The progress of the loading animation (0-1) when undefined, the loading animation will be indeterminate
 */
export const LoadingTransactionStatus: React.FC<LoadingTransactionStatusProps> = ({
  status,
  resultTexts,
  loadingTexts,
  cancelAction,
  successAction,
  loadingProgress,
}) => {
  const resultProgressAnimation = useSharedValue(0);
  const loadingProgressAnimation = useSharedValue(0);
  const svgContentProgressAnimation = useSharedValue(0);

  useEffect(() => {
    if (status === 'LOADING') {
      return;
    }

    resultProgressAnimation.value = withTiming(1, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });
    svgContentProgressAnimation.value = withTiming(1, {
      duration: 200,
      easing: Easing.inOut(Easing.ease),
    });
    loadingProgressAnimation.value = withTiming(1, {
      duration: 100,
      easing: Easing.inOut(Easing.ease),
    });
  }, [loadingProgressAnimation, resultProgressAnimation, svgContentProgressAnimation, status]);

  const resultAnimatedStyles = useAnimatedStyle(
    () => ({
      opacity: resultProgressAnimation.value,
      transform: [
        {
          translateY: interpolate(
            resultProgressAnimation.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }),
    [resultProgressAnimation.value],
  );
  const loadingAnimatedStyles = useAnimatedStyle(
    () => ({
      opacity: 1 - loadingProgressAnimation.value,
      transform: [
        {
          translateY: interpolate(
            loadingProgressAnimation.value,
            [0, 1],
            [0, 20],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }),
    [loadingProgressAnimation.value],
  );

  return (
    <WalletSafeArea>
      <View style={styles.flex1}>
        <View style={{ ...styles.transactionContainer, top: screenHeight / 4 }}>
          <CircularSvgAnimation
            status={status}
            loadingProgress={loadingProgress}
            resultProgressAnimation={resultProgressAnimation}
          />
          <View style={styles.textContainer}>
            <Animated.View style={[styles.positionAbsolute, resultAnimatedStyles]}>
              <Text style={styles.transactionStatusText}>{resultTexts?.title}</Text>
              <Text style={styles.detailText}>{resultTexts?.description}</Text>
            </Animated.View>
            <Animated.View style={[styles.positionAbsolute, loadingAnimatedStyles]}>
              <Text style={styles.transactionStatusText}>{loadingTexts.title}</Text>
              <Text style={styles.detailText}>{loadingTexts.description}</Text>
            </Animated.View>
          </View>
        </View>
        <Animated.View style={[styles.bottomContainer, resultAnimatedStyles]}>
          {status !== 'LOADING' && (
            <PrimaryButton
              onPress={cancelAction.onPress}
              text={getLocalizedString('buttons.close')}
            />
          )}
          {status === 'SUCCESS' && (
            <PrimaryButton
              onPress={successAction.onPress}
              text={getLocalizedString('transactions.see_transaction')}
              buttonStyle={styles.button}
              buttonTextStyle={styles.buttonText}
            />
          )}
        </Animated.View>
      </View>
    </WalletSafeArea>
  );
};
