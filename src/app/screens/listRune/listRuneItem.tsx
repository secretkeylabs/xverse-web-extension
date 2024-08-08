import { Warning } from '@phosphor-icons/react';
import Checkbox from '@ui-library/checkbox';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';

const Container = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
  padding: ${(props) => props.theme.space.s};
  padding-right: ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.xs};
  border: 1px solid;
  border-color: ${(props) => (props.$selected ? props.theme.colors.white_900 : 'transparent')};
  background-color: ${(props) =>
    props.$selected ? props.theme.colors.elevation2 : props.theme.colors.elevation1};
  transition: background-color 0.1s ease, border-color 0.1s ease;
`;

const InfoContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${(props) => props.theme.space.xxxs};
`;

const SubContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
`;

const RuneTitle = styled(StyledP)`
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
`;

const StyledBundleSub = styled(StyledP)`
  width: 100%;
  text-align: left;
`;

const CheckBoxContainer = styled.div((props) => ({
  marginRight: props.theme.space.s,
}));

const SizeInfoContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: ${(props) => props.theme.space.xxs};
`;

type Props = {
  runeAmount: string;
  runeSymbol: string;
  txId: string;
  vout: string;
  satAmount: number;
  selected: boolean;
  onSelect: () => void;
};

function ListRuneItem({
  runeAmount,
  runeSymbol,
  txId,
  vout,
  satAmount,
  selected,
  onSelect,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const showSizeWarning = satAmount >= 100000;

  return (
    <Container data-testid="rune-item" $selected={selected}>
      <CheckBoxContainer>
        <Checkbox checkboxId="list-rune" checked={selected} onChange={onSelect} color="white_400" />
      </CheckBoxContainer>
      <InfoContainer>
        <NumericFormat
          value={runeAmount}
          displayType="text"
          suffix={` ${runeSymbol}`}
          thousandSeparator
          renderText={(value: string) => (
            <RuneTitle typography="body_medium_m" color="white_0">
              {value}
            </RuneTitle>
          )}
        />
        <SubContainer>
          <StyledP typography="body_medium_s" color="white_400">
            {`${getTruncatedAddress(txId, 6)}:${vout}`}
          </StyledP>
          <SizeInfoContainer>
            {showSizeWarning && (
              <Warning size={16} weight="fill" color={Theme.colors.danger_light} />
            )}
            <NumericFormat
              value={satAmount}
              displayType="text"
              prefix={`${t('SIZE')}: `}
              suffix={` ${t('SATS')}`}
              thousandSeparator
              renderText={(value: string) => (
                <StyledBundleSub
                  typography="body_medium_s"
                  color={showSizeWarning ? 'danger_light' : 'white_400'}
                >
                  {value}
                </StyledBundleSub>
              )}
            />
          </SizeInfoContainer>
        </SubContainer>
      </InfoContainer>
    </Container>
  );
}

export default ListRuneItem;
