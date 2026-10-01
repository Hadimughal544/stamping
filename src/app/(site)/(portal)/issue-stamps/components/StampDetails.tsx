"use client";

import { useEffect, useState } from "react";
import { SelectField, TextField } from "@/components/Fields";

export type Purpose = { id: number; name: string; articleCode: string };
export type DraftItem = {
  /** Unique row key: "s<stockId>" for a picked serial, "c<serial>" for a custom one. */
  key: string;
  stockId: number | null;
  customSerial: string | null;
  serial: string;
  denomination: number;
  purposeId: number | null;
  purposeLabel: string;
  purposeOther: string | null;
  reason: string;
};

export const purposeLabel = (p: Purpose) => `${p.name} - ${p.articleCode}`;

/** Today's date as "YYYY-MM-DD" in the browser's local time, for the date input's max. */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = {
  purposes: Purpose[];
  items: DraftItem[];
  issueDate: string;
  onIssueDateChange: (date: string) => void;
  onAdd: (items: DraftItem[]) => void;
  onRemove: (key: string) => void;
};

export function StampDetails({ purposes, items, issueDate, onIssueDateChange, onAdd, onRemove }: Props) {
  const [purposeId, setPurposeId] = useState("");
  const [others, setOthers] = useState(false);
  const [purposeOther, setPurposeOther] = useState("");
  const [denomination, setDenomination] = useState("");
  // The typed denomination, debounced; serials are loaded (and generated when low) for this value.
  const [query, setQuery] = useState("");
  const [serials, setSerials] = useState<{ id: number; serial: string }[]>([]);
  const [serialId, setSerialId] = useState("");
  const [customSerial, setCustomSerial] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [count, setCount] = useState("1");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loadingSerials, setLoadingSerials] = useState(false);

  useEffect(() => {
    setSerialId("");
    const t = setTimeout(() => setQuery(denomination), 400);
    return () => clearTimeout(t);
  }, [denomination]);

  // Load available serials for the typed denomination; the server generates more when fewer than 50 remain.
  useEffect(() => {
    const n = Number(query);
    if (!query || n > 99999) {
      setSerials([]);
      setLoadingSerials(false);
      return;
    }
    let cancelled = false;
    setLoadingSerials(true);
    fetch(`/api/serials?denomination=${n}`)
      .then((r) => r.json())
      .then((d: { serials?: { id: number; serial: string }[] }) => {
        if (!cancelled) setSerials(d.serials ?? []);
      })
      .finally(() => !cancelled && setLoadingSerials(false));
    return () => {
      cancelled = true;
    };
  }, [query]);

  const settled = denomination === query && !loadingSerials;
  const taken = new Set(items.map((i) => i.stockId));
  const free = settled ? serials.filter((s) => !taken.has(s.id)) : [];

  function add() {
    setError("");
    const n = customSerial ? 1 : Number(count);
    const amount = Number(denomination);
    if (denomination && (!Number.isInteger(amount) || amount < 1 || amount > 99999)) {
      return setError("Enter a denomination from 1 to 99,999.");
    }
    if (!Number.isInteger(n) || n < 1) return setError("Enter a valid number of stamps.");
    if (items.length + n > 50) return setError("At most 50 stamps can be issued at once.");

    const purpose = purposes.find((p) => String(p.id) === purposeId);
    const other = others ? purposeOther.trim() : "";
    const common = {
      denomination: amount,
      purposeId: others ? null : (purpose?.id ?? null),
      purposeLabel: others ? other.toUpperCase() || "-" : purpose ? purposeLabel(purpose) : "-",
      purposeOther: other || null,
      reason: reason.trim(),
    };

    if (customSerial) {
      const serial = customValue.trim().toUpperCase();
      if (!serial) return setError("Please enter a serial number.");
      if (!/^[A-Z0-9/-]+$/.test(serial)) return setError("Serial number may only contain letters, digits, - and /.");
      if (serial.length > 40) return setError("Serial number is too long.");
      if (items.some((i) => i.serial === serial)) return setError("This serial number is already added.");
      onAdd([{ ...common, key: `c${serial}`, stockId: null, customSerial: serial, serial }]);
      setCustomValue("");
      return;
    }

    if (!denomination) return setError("Enter a denomination to pick a serial number, or tick Custom.");
    if (!serialId) return setError("Please select a serial number.");

    // Take the selected serial plus the next available ones in stock order.
    const start = free.findIndex((s) => String(s.id) === serialId);
    const chosen = free.slice(start, start + n);
    if (chosen.length < n) return setError(`Only ${free.length - start} stamp(s) available from the selected serial.`);

    onAdd(chosen.map((s) => ({ ...common, key: `s${s.id}`, stockId: s.id, customSerial: null, serial: s.serial })));
    setSerialId("");
    setCount("1");
  }

  return (
    <>
      <div className="mx-auto grid max-w-[1030px] gap-x-[330px] gap-y-5 max-lg:gap-x-12 md:grid-cols-2">
        <div>
          {others ? (
            <TextField label="Purpose" value={purposeOther} onChange={setPurposeOther} />
          ) : (
            <SelectField
              label="Purpose"
              placeholder="Select Purpose"
              value={purposeId}
              onChange={setPurposeId}
              options={purposes.map((p) => ({ value: String(p.id), label: purposeLabel(p) }))}
            />
          )}
          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-[17px]">
            <input
              type="checkbox"
              checked={others}
              onChange={(e) => setOthers(e.target.checked)}
              className="h-6 w-6 accent-[#7fcf7f]"
            />
            Others
          </label>
        </div>

        <div>
          <TextField
            label="Denomination"
            value={denomination}
            onChange={(v) => setDenomination(v.replace(/\D/g, "").replace(/^0+/, ""))}
            inputMode="numeric"
          />
          <p className="mt-1 text-[13px] text-muted">Rs 1 – 99,999</p>
        </div>

        <div>
          {customSerial ? (
            <TextField label="Serial Number" value={customValue} onChange={(v) => setCustomValue(v.toUpperCase())} />
          ) : (
            <SelectField
              label="Serial Number"
              placeholder={denomination && !settled ? "Loading…" : "Select serial number"}
              value={serialId}
              onChange={setSerialId}
              disabled={!settled}
              options={free.map((s) => ({ value: String(s.id), label: s.serial }))}
            />
          )}
          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-[17px]">
            <input
              type="checkbox"
              checked={customSerial}
              onChange={(e) => setCustomSerial(e.target.checked)}
              className="h-6 w-6 accent-[#7fcf7f]"
            />
            Custom
          </label>
        </div>
        <TextField
          label="No. Of Stamps"
          value={customSerial ? "1" : count}
          onChange={(v) => setCount(v.replace(/\D/g, ""))}
          readOnly={customSerial}
          inputMode="numeric"
        />

        <div>
          <span className="u-label">Date</span>
          <input
            type="date"
            value={issueDate}
            max={today()}
            aria-label="Date"
            onChange={(e) => onIssueDateChange(e.target.value)}
            className="u-field"
          />
          <p className="mt-1 text-[13px] text-muted">Leave empty to use the current date &amp; time</p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[1045px]">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason"
          aria-label="Reason"
          rows={4}
          className="w-full border border-[#ccc] px-2 py-2 text-[17px] outline-none placeholder:text-muted focus:border-[#7fcf7f]"
        />
        <div className="mt-2 flex items-center justify-end gap-4">
          {error && <p className="text-[15px] text-danger">{error}</p>}
          <button type="button" onClick={add} className="btn-green">
            Add
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mx-auto mt-8 max-w-[1045px] overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sr. #</th>
                <th>Stamp Serial Number</th>
                <th>Denomination</th>
                <th>Purpose</th>
                <th>Reason</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.key}>
                  <td>{i + 1}</td>
                  <td>{it.serial}</td>
                  <td>{it.denomination}</td>
                  <td>{it.purposeLabel}</td>
                  <td>{it.reason || "-"}</td>
                  <td>
                    <button type="button" onClick={() => onRemove(it.key)} className="cursor-pointer text-danger hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
