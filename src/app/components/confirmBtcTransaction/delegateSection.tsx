import DropDownIcon from '@assets/img/transactions/dropDownIcon.svg';
import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import { WarningOctagon } from '@phosphor-icons/react';
import { animated, config, useSpring } from '@react-spring/web';
import { RuneSummary } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: `${props.theme.space.m} 0`,
  justifyContent: 'center',
  marginBottom: props.theme.space.s,
}));

const RowContainer = styled.div((props) => ({
  padding: `0 ${props.theme.space.m}`,
  marginTop: `${props.theme.space.m}`,
}));

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
}));

const Header = styled(RowCenter)((props) => ({
  padding: `0 ${props.theme.space.m}`,
}));

const WarningButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => props.theme.colors.elevation1};
  padding: ${(props) => props.theme.space.m};
  padding-bottom: 0;
`;

const DelegationDescription = styled(StyledP)`
  padding: ${(props) => props.theme.space.s} ${(props) => props.theme.space.m};
  padding-bottom: ${(props) => props.theme.space.xs};
`;

const Title = styled(StyledP)`
  margin-left: ${(props) => props.theme.space.xxs};
`;

type Props = {
  delegations?: RuneSummary['burns'];
};

function DelegateSection({ delegations }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });

  const [showDelegationInfo, setShowDelegationInfo] = useState(false);

  const slideInStyles = useSpring({
    config: { ...config.gentle, duration: 200 },
    from: { opacity: 0, maxHeight: 0 },
    to: { opacity: 1, maxHeight: 100 },
    reverse: !showDelegationInfo,
  });

  const arrowRotation = useSpring({
    transform: showDelegationInfo ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { ...config.stiff },
  });

  if (!delegations?.length) return null;

  return (
    <Container>
      <Header>
        <StyledP typography="body_medium_m" color="white_200">
          {t('YOU_WILL_DELEGATE')}
        </StyledP>
      </Header>
      {delegations.map((delegation) => (
        <RowContainer key={delegation.runeName}>
          <RuneAmount
            tokenName={delegation.runeName}
            amount={String(delegation.amount)}
            divisibility={delegation.divisibility}
          />
        </RowContainer>
      ))}
      <WarningButton type="button" onClick={() => setShowDelegationInfo((prevState) => !prevState)}>
        <RowCenter>
          <WarningOctagon weight="fill" color={Theme.colors.caution} size={16} />
          <Title typography="body_medium_s" color="caution">
            {t('UNKNOWN_RUNE_RECIPIENTS')}
          </Title>
        </RowCenter>
        <animated.img style={arrowRotation} src={DropDownIcon} alt="Drop Down" />
      </WarningButton>
      <animated.div style={slideInStyles}>
        <DelegationDescription typography="body_medium_s" color="white_200">
          {t('RUNE_DELEGATION_DESCRIPTION')}
        </DelegationDescription>
      </animated.div>
    </Container>
  );
}

export default DelegateSection;
