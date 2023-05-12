import { ReactNode, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import Cross from '@assets/img/dashboard/X.svg';
import styled from 'styled-components';
import CaretRight from '@assets/img/transactions/thin_caret_right.svg';
import CopyButton from '@components/copyButton';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 16,
  justifyContent: 'center',
  marginBottom: 12,
}));

const RecipientTitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  fontSize: 11,
  color: props.theme.colors.white[200],
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
});

const IconContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

const TransparentButton = styled.button({
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  marginLeft: 10,
});

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[400],
}));

const DetailButton = styled.button((props) => ({
  background: 'transparent',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  h1: {
    ...props.theme.body_medium_m,
    color: props.theme.colors.white[200],
  },
}));

const ColumnContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  marginTop: 12,
});

const CrossContainer = styled.div({
  display: 'flex',
  marginTop: 10,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
});

const OrdinalOuterImageContainer = styled.div({
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 2,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,

});

const OrdinalBackgroundContainer = styled(animated.div)({
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  position: 'fixed',
  zIndex: 10,
  background: 'rgba(18, 21, 30, 0.8)',
  backdropFilter: 'blur(16px)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
});

const SecondIcon = styled.img({
  marginRight: 10,
});

interface Props {
  transactionType: string;
  transactionDetail?: string;
  icon: string;
  title: string;
  children?: ReactNode;
  heading?: string;
  secondTitle: string;
  secondValue: string;
  secondIcon?: string;
  showCopyButton?: boolean;
  showDetailsButton?: boolean;
}
function BRC20TransactionDetailComponent({
  transactionType,
  transactionDetail,
  icon,
  title,
  heading,
  secondTitle,
  secondValue,
  secondIcon,
  showCopyButton,
  children,
  showDetailsButton,
}: Props) {
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const styles = useSpring({
    from: {
      opacity: 0,
      y: 24,
    },
    to: {
      y: 0,
      opacity: 1,
    },
    delay: 100,
  });
  const onButtonClick = () => {
    setShowTransactionDetail(true);
  };

  const onCrossClick = () => {
    setShowTransactionDetail(false);
  };

  return (
    <>
      {showTransactionDetail && (
      <OrdinalBackgroundContainer style={styles}>
        <CrossContainer onClick={onCrossClick}>
          <TransparentButton>
            <img src={Cross} alt="cross" />
          </TransparentButton>
        </CrossContainer>
        {children}
      </OrdinalBackgroundContainer>
      )}
      <Container>
        <RowContainer>
          <RecipientTitleText>{heading}</RecipientTitleText>
          {showDetailsButton && (
          <DetailButton onClick={onButtonClick}>
            <h1>See details</h1>
            <img src={CaretRight} alt="arrow" />
          </DetailButton>
          )}
        </RowContainer>
        <RowContainer>
          <Icon src={icon} />
          <TitleText>{title}</TitleText>
          <ColumnContainer>
            <ValueText>{transactionType}</ValueText>
            {transactionDetail && <SubValueText>{transactionDetail}</SubValueText>}
          </ColumnContainer>
        </RowContainer>
        <RowContainer>
          <IconContainer>
            {secondIcon && <SecondIcon src={secondIcon} alt="icon" />}
            <TitleText>{secondTitle}</TitleText>
          </IconContainer>
          <IconContainer>
            <ValueText>{secondValue}</ValueText>
            {showCopyButton && <CopyButton text={secondValue} />}
          </IconContainer>
        </RowContainer>
      </Container>
    </>
  );
}

export default BRC20TransactionDetailComponent;
