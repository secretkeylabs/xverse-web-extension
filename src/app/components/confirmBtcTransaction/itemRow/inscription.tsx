import OrdinalIcon from '@assets/img/rareSats/ic_ordinal_small_over_card.svg';
import { Eye } from '@phosphor-icons/react';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { btcTransaction, type RareSatsType } from '@secretkeylabs/xverse-core';
import Avatar from '@ui-library/avatar';
import { StyledP } from '@ui-library/common.styled';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';
import Theme from 'theme';
import { useTxSummaryContext } from '../hooks/useTxSummaryContext';

const RowCenter = styled.div<{ spaceBetween?: boolean; gap?: boolean }>((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
  gap: props.gap ? props.theme.space.xs : 0,
}));

const InscriptionNumberContainer = styled.button`
  background-color: transparent;
`;

const NumberTypeContainer = styled.div`
  text-align: right;
`;

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.m};
`;

const InscriptionNumber = styled(StyledP)`
  margin-right: ${(props) => props.theme.space.xs};
`;
const ContentType = styled(StyledP)`
  word-break: break-word;
`;

const Dot = styled(StyledP)`
  margin: 0 ${(props) => props.theme.space.xxs};
`;

type Props = {
  inscription:
    | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
    | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] });
  hideTypeSizeInfo?: boolean;
  onShowInscription: (
    inscription:
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] }),
  ) => void;
};

export default function Inscription({
  inscription,
  hideTypeSizeInfo = false,
  onShowInscription,
}: Props) {
  const { t } = useTranslation('translation');
  const { brc20Summary } = useTxSummaryContext();
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
              placeholderIcon={OrdinalIcon}
              showContentTypeThumbnail
            />
          }
        />
      </AvatarContainer>
      <RowCenter spaceBetween gap>
        <div>
          {!hideTypeSizeInfo && (
            <StyledP typography="body_medium_m" color="white_0">
              {t('COMMON.INSCRIPTION')}
            </StyledP>
          )}
        </div>
        {brc20Summary ? (
          <NumberTypeContainer>
            <RowCenter>
              <StyledP typography="body_medium_m" color="white_0">
                BRC20 {brc20Summary.op.charAt(0).toUpperCase() + brc20Summary.op.slice(1)}
              </StyledP>
              {!!brc20Summary.status && (
                <>
                  <Dot typography="body_medium_m" color="white_0">
                    ·
                  </Dot>
                  <StyledP typography="body_medium_m" color={brc20Summary.statusColor}>
                    {brc20Summary.status}
                  </StyledP>
                </>
              )}
            </RowCenter>
            <NumericFormat
              value={brc20Summary.value}
              displayType="text"
              thousandSeparator
              renderText={(text) => (
                <ContentType typography="body_medium_s" color="white_400">
                  {text}
                </ContentType>
              )}
              suffix={` ${brc20Summary.tick}`}
            />
          </NumberTypeContainer>
        ) : (
          <NumberTypeContainer>
            <InscriptionNumberContainer
              type="button"
              onClick={() => onShowInscription(inscription)}
            >
              <RowCenter>
                <InscriptionNumber
                  data-testid="inscription-number"
                  typography="body_medium_m"
                  color="white_0"
                >
                  {inscription.number}
                </InscriptionNumber>
                <Eye color={Theme.colors.white_0} size={20} weight="fill" />
              </RowCenter>
            </InscriptionNumberContainer>
            <ContentType typography="body_medium_s" color="white_400">
              {inscription.contentType}
            </ContentType>
          </NumberTypeContainer>
        )}
      </RowCenter>
    </RowCenter>
  );
}
