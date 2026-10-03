import "server-only";
import bwipjs from "bwip-js";
import QRCode from "qrcode";

/**
 * QR in the same symbol style as the original e-stamp: version 9 (53×53 modules), error correction Q,
 * mask 5 and a 4-module quiet zone, at 20px per module. A link too long for version 9 gets the
 * smallest version that fits instead.
 */
async function renderQr(link: string) {
  const style = { errorCorrectionLevel: "Q", maskPattern: 5, margin: 4, scale: 20 } as const;
  try {
    return await QRCode.toDataURL(link, { ...style, version: 9 });
  } catch {
    return QRCode.toDataURL(link, style);
  }
}

/** Barcode (serial) and QR (link to the public scan page) images for one stamp, as data URLs. */
export async function renderStampCodes(serial: string, link: string) {
  const [qrSrc, barcode] = await Promise.all([
    renderQr(link),
    bwipjs.toBuffer({
      bcid: "code128",
      text: serial,
      scale: 2,
      height: 12,
      includetext: false,
      backgroundcolor: "FFFFFF",
    }),
  ]);
  return { qrSrc, barcodeSrc: `data:image/png;base64,${barcode.toString("base64")}` };
}
