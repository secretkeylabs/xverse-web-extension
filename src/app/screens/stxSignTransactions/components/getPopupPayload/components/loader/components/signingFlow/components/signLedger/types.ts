import type TransportWebUSB from '@ledgerhq/hw-transport-webusb';

export type Transport = Awaited<ReturnType<typeof TransportWebUSB.create>>;
