import Link from '@assets/img/rareSats/link.svg';
import useWalletSelector from '@hooks/useWalletSelector';
import { btcTransaction, type RareSatsType } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';
import Inscription from './inscription';
import RareSats from './rareSats';

const Container = styled.div`
  margin-bottom: ${(props) => props.theme.space.s};
`;

const LinkContainer = styled.div`
  display: flex;
  width: 32px;
  justify-content: center;
  margin-top: ${(props) => props.theme.space.xxxs};
  margin-bottom: -10px;
`;

type Props = {
  bundleSize?: number;
  inscriptions:
    | (btcTransaction.IOInscription & { satributes: RareSatsType[] })[]
    | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] })[];
  satributes: btcTransaction.IOSatribute[] | Omit<btcTransaction.IOSatribute, 'offset'>[];
  onShowInscription: (
    inscription:
      | (btcTransaction.IOInscription & { satributes: RareSatsType[] })
      | (Omit<btcTransaction.IOInscription, 'offset'> & { satributes: RareSatsType[] }),
  ) => void;
};

function InscriptionSatributeRow({
  bundleSize,
  inscriptions,
  satributes,
  onShowInscription,
}: Props) {
  const { hasActivatedRareSatsKey } = useWalletSelector();
  return (
    <Container>
      {inscriptions.map((inscription, index) => {
        const inscriptionSatributes = inscription.satributes.filter(
          (rareSatsArr) => rareSatsArr.length > 0,
        );
        return (
          <>
            <Container key={inscription.number}>
              <Inscription inscription={inscription} onShowInscription={onShowInscription} />
              {(bundleSize && inscriptions.length > index + 1) ||
                (hasActivatedRareSatsKey && inscriptionSatributes.length > 0 && (
                  <LinkContainer>
                    <img src={Link} alt="link" />
                  </LinkContainer>
                ))}
            </Container>
            {hasActivatedRareSatsKey && (
              <RareSats bundleSize={bundleSize} inscriptionSatributes={inscriptionSatributes} />
            )}
          </>
        );
      })}
      {hasActivatedRareSatsKey && <RareSats bundleSize={bundleSize} satributes={satributes} />}
    </Container>
  );
}

export default InscriptionSatributeRow;
