/**
 * The vendors printed in a stamp's "Vendor Information", each with its own login
 * (created by `npm run db:vendors`). A stamp shows the vendor of the user who issued it.
 */
export const VENDORS = [
  { username: "ghulam.ibrahim", name: "Ghulam Ibrahim", code: "PB-LHR-1454", office: "ETO Office" },
  { username: "hamza.abbas", name: "Hamza Abbas", code: "PB-LHR-1398", office: "DHA Halloki" },
] as const;

export type Vendor = (typeof VENDORS)[number];

/** "Name | Code | Office" for the vendor who issued a stamp; users not in VENDORS show "Name | Code". */
export function vendorInfo(user: { displayName: string; vendorCode: string }) {
  const v = VENDORS.find((x) => x.code === user.vendorCode);
  return v ? `${v.name} | ${v.code} | ${v.office}` : `${user.displayName} | ${user.vendorCode}`;
}
