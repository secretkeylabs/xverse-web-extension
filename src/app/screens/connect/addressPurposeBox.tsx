import { AddressPurpose } from '@sats-connect/core';
import { getTruncatedAddress } from '@utils/helper';
import styled from 'styled-components';

const AddressBox = styled.div((props) => ({
  padding: `${props.theme.spacing(10)}px ${props.theme.space.m}`,
  display: 'flex',
  maxHeight: 60,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: props.theme.colors.elevation6_800,
  marginBottom: 1,
  ':first-of-type': {
    borderTopLeftRadius: props.theme.radius(2),
    borderTopRightRadius: props.theme.radius(2),
  },
  ':last-of-type': {
    borderBottomLeftRadius: props.theme.radius(2),
    borderBottomRightRadius: props.theme.radius(2),
  },
}));

const AddressContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const AddressImage = styled.img((props) => ({
  width: 20,
  height: 20,
  marginRight: props.theme.space.xs,
}));

const AddressTextTitle = styled.h2((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  textAlign: 'center',
}));

const TruncatedAddress = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'right',
}));

const BnsName = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
  textAlign: 'right',
}));

function AddressPurposeBox({
  purpose,
  icon,
  title,
  address,
  bnsName,
}: {
  purpose: AddressPurpose;
  icon: string;
  title: string;
  address: string;
  bnsName?: string;
}) {
  return (
    <AddressBox key={purpose}>
      <AddressContainer>
        <AddressImage src={icon} />
        <AddressTextTitle>{title}</AddressTextTitle>
      </AddressContainer>
      <div>
        {bnsName ? <BnsName>{bnsName}</BnsName> : null}
        <TruncatedAddress>{getTruncatedAddress(address)}</TruncatedAddress>
      </div>
    </AddressBox>
  );
}

export default AddressPurposeBox;
