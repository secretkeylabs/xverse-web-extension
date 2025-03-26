import OrdinalIcon from '@assets/img/rareSats/ic_ordinal_small.svg';
import type { SatRangeInscription } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const InfoContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  margin-right: ${(props) => props.theme.space.m};
`;

const IconsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

const StyledBundleId = styled(StyledP)`
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: left;
`;

const InscriptionText = styled(StyledP)`
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin-left: 4px;
  text-align: left;
`;

const StyledBundleSub = styled(StyledP)`
  text-align: left;
  width: 100%;
`;

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  flex: 1;
  padding: ${(props) => props.theme.space.m};
  border-radius: ${(props) => props.theme.space.xs};
  background-color: ${(props) => props.theme.colors.elevation1};
  justify-content: space-between;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-direction: row;
`;

// inscription number is parsed to BigNumber cuz it can be number | BigNumber depending on the data source
function ExoticSatsRow({
  title,
  satAmount,
  inscriptions,
  icons,
  showNumberOfInscriptions = false,
}: {
  title: string;
  satAmount: number;
  inscriptions: SatRangeInscription[];
  showNumberOfInscriptions?: boolean;
  icons: ReactNode;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'COMMON' });
  return (
    <ItemContainer>
      <InfoContainer>
        <StyledBundleId typography="body_bold_m" color="white_0">
          {title}
        </StyledBundleId>
        <NumericFormat
          value={satAmount}
          displayType="text"
          suffix={` ${t('SATS')}`}
          thousandSeparator
          renderText={(value: string) => (
            <StyledBundleSub typography="body_medium_m" color="white_400">
              {value}
            </StyledBundleSub>
          )}
        />
        {showNumberOfInscriptions && inscriptions.length ? (
          <Row>
            <img src={OrdinalIcon} alt="ordinal" />
            <InscriptionText typography="body_medium_m" color="white_0">
              {inscriptions.length > 1
                ? `+${inscriptions.length}`
                : BigNumber(inscriptions[0].inscription_number).toString()}
            </InscriptionText>
          </Row>
        ) : (
          inscriptions.map((inscription) => (
            <Row key={inscription.id}>
              <img src={OrdinalIcon} alt="ordinal" />
              <InscriptionText typography="body_medium_m" color="white_0">
                {BigNumber(inscription.inscription_number).toString()}
              </InscriptionText>
            </Row>
          ))
        )}
      </InfoContainer>
      <IconsContainer>{icons}</IconsContainer>
    </ItemContainer>
  );
}

export default ExoticSatsRow;
