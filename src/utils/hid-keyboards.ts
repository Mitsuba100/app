import type {KeyboardDictionary} from '@the-via/reader';
import type {Device, VendorProductIdMap} from '../types/types';
import {canConnect} from './keyboard-api';
import {scanDevices} from './usb-hid';

export function getVendorProductId(vendorId: number, productId: number) {
  // JS bitwise operations is only 32-bit so we lose numbers if we shift too high
  return vendorId * 65536 + productId;
}

function definitionExists(
  {productId, vendorId}: Device,
  definitions: KeyboardDictionary,
) {
  const definition = definitions[getVendorProductId(vendorId, productId)];
  return definition && (definition.v2 || definition.v3);
}

const idExists = ({productId, vendorId}: Device, vpidMap: VendorProductIdMap) =>
  vpidMap[getVendorProductId(vendorId, productId)];

export const getRecognisedDevices = async (
  vpidMap: VendorProductIdMap,
  forceRequest = false,
) => {
  const usbDevices = await scanDevices(forceRequest);
  console.log('All USB HID Devices found:', usbDevices);
  console.log('Supported VPID Map:', vpidMap);
  return usbDevices.filter((device) => {
    const vpid = getVendorProductId(device.vendorId, device.productId);
    const validVendorProduct = idExists(device, vpidMap);
    console.log(`Checking device: ${device.productName} (VPID: ${vpid}), Supported: ${!!validVendorProduct}`);
    // attempt connection
    const connected = validVendorProduct && canConnect(device);
    if (validVendorProduct) {
        console.log(`Device support match found! canConnect: ${canConnect(device)}`);
    }
    return connected;
  });
};
