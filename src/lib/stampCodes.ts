import "server-only";
import bwipjs from "bwip-js";
import QRCode from "qrcode";

/** Barcode (serial) and QR (link to the public scan page) images for one stamp, as data URLs. */
export async function renderStampCodes(serial: string, link: string) {
  const [qrSrc, barcode] = await Promise.all([
    QRCode.toDataURL(link, { margin: 1, width: 160 }),
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
