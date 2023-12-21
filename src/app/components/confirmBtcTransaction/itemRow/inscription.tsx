import { Eye } from '@phosphor-icons/react';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { btcTransaction } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import Avatar from './avatar';

export interface TokenImageProps {
  inscription: btcTransaction.IOInscription;
  bundleSize?: number;
  hideTypeSizeInfo?: boolean;
  onShowInscription: (inscription: btcTransaction.IOInscription) => void;
}

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
}));

const InscriptionNumberContainer = styled.button`
  background-color: transparent;
`;

const NumberTypeContainer = styled.div`
  text-align: right;
`;

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.xs};
`;

const InscriptionNumber = styled(StyledP)`
  margin-right: ${(props) => props.theme.space.xs};
`;

export default function Inscription({
  inscription,
  bundleSize,
  hideTypeSizeInfo = false,
  onShowInscription,
}: TokenImageProps) {
  const { t } = useTranslation('translation');

  return (
    <RowCenter>
      <AvatarContainer>
        <Avatar
          src={
            <OrdinalImage
              ordinal={{
                number: inscription.number,
                id: inscription.id,
                content_type: inscription.contentType,
              }}
            />
          }
        />
      </AvatarContainer>
      <RowCenter spaceBetween>
        <div>
          {!hideTypeSizeInfo && (
            <>
              <StyledP typography="body_medium_m" color="white_200">
                {t('COMMON.INSCRIPTION')}
              </StyledP>
              {bundleSize && (
                <NumericFormat
                  value={bundleSize}
                  displayType="text"
                  thousandSeparator
                  prefix={`${t('COMMON.SIZE')}: `}
                  suffix={` ${t('COMMON.SATS')}`}
                  renderText={(value: string) => (
                    <StyledP typography="body_medium_s" color="white_400">
                      {value}
                    </StyledP>
                  )}
                />
              )}
            </>
          )}
        </div>
        <NumberTypeContainer>
          <InscriptionNumberContainer
            type="button"
            onClick={() => {
              onShowInscription(inscription);
            }}
          >
            <RowCenter>
              <InscriptionNumber typography="body_medium_m" color="white_200">
                {inscription.number}
              </InscriptionNumber>
              <Eye color={Theme.colors.white_0} size={20} weight="fill" />
            </RowCenter>
          </InscriptionNumberContainer>
          <StyledP typography="body_medium_s" color="white_400">
            {inscription.contentType}
          </StyledP>
        </NumberTypeContainer>
      </RowCenter>
    </RowCenter>
  );
}
