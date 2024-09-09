import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import type { Bundle } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { getTruncatedAddress } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
  padding: ${(props) => props.theme.space.s};
  padding-left ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.xs};
  border: 1px solid 'transparent';
  background-color: ${(props) => props.theme.colors.elevation1};
  gap: ${(props) => props.theme.space.s}; 
  :hover {
      cursor: pointer;
  },
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

const SizeInfoContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: ${(props) => props.theme.space.xxs};
`;

const RangeContainer = styled.div``;

const Range = styled.div`
  display: flex;
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.colors.white_800};
  padding: 1px;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
`;

type Props = {
  runeAmount: string;
  runeSymbol: string;
  runeId: string;
  txId: string;
  vout: string;
  satAmount: number;
  bundle: Bundle;
};

function RuneBundleRow({ runeAmount, runeSymbol, runeId, txId, vout, satAmount, bundle }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'COMMON' });
  const navigate = useNavigate();
  const satributesArr = bundle.satributes.flatMap((item) => item);
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();

  const handleOnClick = () => {
    // exotics v1 wont show range details only bundle details
    setSelectedSatBundleDetails(bundle);
    navigate('/nft-dashboard/rare-sats-bundle', { state: { source: 'RuneBundlesTab', runeId } });
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleOnClick();
    }
  };

  return (
    <Container
      role="button"
      data-testid="rune-item"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={handleOnClick}
    >
      <RangeContainer>
        <Range>
          {satributesArr.map((satribute) => (
            <RareSatIcon key={satribute} type={satribute} size={28} />
          ))}
        </Range>
      </RangeContainer>
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
            <NumericFormat
              value={satAmount}
              displayType="text"
              prefix={`${t('SIZE')}: `}
              suffix={` ${t('SATS')}`}
              thousandSeparator
              renderText={(value: string) => (
                <StyledBundleSub typography="body_medium_s" color="white_400">
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

export default RuneBundleRow;
