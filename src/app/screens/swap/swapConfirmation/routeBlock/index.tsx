import {
  Container,
  FoldButton,
  TitleContainer,
  TitleText,
} from '@screens/swap/swapConfirmation/stxInfoBlock';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { cloneElement, useState } from 'react';
import { SwapConfirmationInput } from '@screens/swap/swapConfirmation/useConfirmSwap';

const RouteDescription = styled.p((props) => ({
  ...props.theme.body_m,
  fontWeight: 400,
  color: props.theme.colors.white[400],
  marginTop: props.theme.spacing(8),
}));

const RouteProgress = styled.div((props) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 1,
  marginTop: props.theme.spacing(8),
  marginLeft: -props.theme.spacing(3.5),
  marginRight: -props.theme.spacing(3.5),
}));

const DashLine = styled.div((props) => ({
  borderTop: `1.5px dashed ${props.theme.colors.white[800]}`,
  width: '100%',
  position: 'absolute',
  left: 0,
  top: 12,
}));

const ProgressItem = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  zIndex: '2',
  paddingRight: props.theme.spacing(3.5),
  paddingLeft: props.theme.spacing(3.5),
  background: props.theme.colors.background.elevation1,
}));

const ProgressItemText = styled.p((props) => ({
  ...props.theme.body_m,
  fontWeight: 400,
  color: props.theme.colors.white[0],
  marginTop: props.theme.spacing(4),
}));

export default function RouteBlock({ swap }: { swap: SwapConfirmationInput }) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  const [isFold, setIsFold] = useState(false);
  return (
    <Container>
      <TitleContainer>
        <TitleText>{t('ROUTE')}</TitleText>
        <FoldButton isFold={isFold} onSwitch={() => setIsFold((prev) => !prev)} />
      </TitleContainer>
      {isFold ? null : (
        <>
          <RouteProgress>
            <DashLine />
            {swap.routers.map(({ name, image }) => (
              <ProgressItem>
                {cloneElement(image as any, { size: 24 })}
                <ProgressItemText>{name}</ProgressItemText>
              </ProgressItem>
            ))}
          </RouteProgress>
          <RouteDescription>{t('ROUTE_DESC')}</RouteDescription>
        </>
      )}
    </Container>
  );
}
