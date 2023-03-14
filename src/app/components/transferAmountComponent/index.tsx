import styled from 'styled-components';
import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import { useTranslation } from 'react-i18next';
import {
  animated, config, useSpring,
} from '@react-spring/web';
import TransferDetailView from '@components/transferDetailView';
import { useState } from 'react';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.background.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  marginBottom: 12,
}));

const FromContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(13),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[0],
}));

const DescriptionText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  marginTop: props.theme.spacing(6),
  marginBottom: props.theme.spacing(4),
  color: props.theme.colors.white[400],
}));

const SubValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  fontSize: 12,
  color: props.theme.colors.white[400],
}));

const Icon = styled.img((props) => ({
  marginRight: props.theme.spacing(4),
  width: 32,
  height: 32,
  borderRadius: 30,
}));

interface ColumnProps {
  isExpanded: boolean;
}

const ColumnContainer = styled.div<ColumnProps>((props) => ({
  display: 'flex',
  flexDirection: props.isExpanded ? 'column' : 'row',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: props.isExpanded ? 'flex-end' : 'center',
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
});

const ExpandedContainer = styled(animated.div)({
  display: 'flex',
  flexDirection: 'column',
  marginTop: 16,
});

const Button = styled.button((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'transparent',
  marginLeft: props.theme.spacing(4),
}));

interface Props {
  title: string;
  description?: string;
  value: string;
  address?: string;
  subTitle?: string;
  subValue?: string;
  icon?: string;

}

function TransferAmountComponent({
  title, address, value, subValue, description, icon, subTitle,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [isExpanded, setIsExpanded] = useState(false);

  const slideInStyles = useSpring({
    config: { ...config.gentle, duration: 400 },
    from: { opacity: 0, height: 0 },
    to: {
      opacity: isExpanded ? 1 : 0,
      height: isExpanded ? 90 : 0,
    },
  });

  const arrowRotation = useSpring({
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

  const renderAmount = value && (
    <>
      <ValueText>{value}</ValueText>
      {isExpanded && subValue && <SubValueText>{subValue}</SubValueText>}
    </>
  );

  const onArrowClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Container>
      <RowContainer>
        <TitleText>{title}</TitleText>
        <ColumnContainer isExpanded={isExpanded}>
          {!isExpanded && renderAmount}
          <Button onClick={onArrowClick}>
            <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
          </Button>
        </ColumnContainer>
      </RowContainer>

      {isExpanded && (
      <ExpandedContainer style={slideInStyles}>
        {description && <DescriptionText>{description}</DescriptionText>}
        <RowContainer>
          {icon && <Icon src={icon} />}
          <TitleText>{subValue === '' ? t('AMOUNT') : t('ASSET')}</TitleText>
          <ColumnContainer isExpanded={isExpanded}>
            {renderAmount}
          </ColumnContainer>
        </RowContainer>
        <FromContainer>
          <TransferDetailView title={subTitle} address={address!} />
        </FromContainer>
      </ExpandedContainer>
      )}
    </Container>
  );
}

export default TransferAmountComponent;
