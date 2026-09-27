"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import { confirmOtp, resendOtp } from "../actions";

type Props = {
  contact: string;
  resendIn: number;
  devCode?: string;
  onVerified: () => void;
  onClose: () => void;
};

export function OtpModal({ contact, resendIn, devCode, onVerified, onClose }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deadline, setDeadline] = useState(() => Date.now() + resendIn * 1000);
  const [now, setNow] = useState(() => Date.now());
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const toast = useToast();

  useEffect(() => {
    inputs.current[0]?.focus();
    if (devCode) toast(`Demo mode: your OTP is ${devCode}`, "success");
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
    // Only on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      // Pasted a whole code.
      const next = clean.slice(0, 6).split("");
      setDigits([...next, ...Array(6 - next.length).fill("")]);
      inputs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    setError("");
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "Enter") verify();
  }

  async function verify() {
    const code = digits.join("");
    if (code.length !== 6) return setError("Invalid OTP");
    setBusy(true);
    const res = await confirmOtp(contact, code);
    setBusy(false);
    if (res.ok) onVerified();
    else {
      setError("Invalid OTP");
      setDigits(Array(6).fill(""));
      inputs.current[0]?.focus();
    }
  }

  async function resend() {
    const res = await resendOtp(contact);
    if (!res.ok) return toast(res.error, "error");
    setDeadline(Date.now() + res.resendIn * 1000);
    if (res.devCode) toast(`Demo mode: your OTP is ${res.devCode}`, "success");
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal aria-labelledby="otp-title">
      <div className="relative w-full max-w-[577px] rounded-sm bg-white px-6 pt-10 pb-12 text-center shadow-xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-5 cursor-pointer text-[20px] text-[#555]">
          ×
        </button>
        <h2 id="otp-title" className="text-[25px] font-bold text-[#333]">
          Contact Verification
        </h2>
        <p className="mt-4 text-[17px] text-[#555]">Please enter OTP you received on your mobile number</p>
        <p className="text-[17px] font-bold text-[#333]">{contact.replace("-", "")}</p>

        <div className="mt-6 flex justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              className="h-[52px] w-[54px] rounded-[3px] border-2 border-[#ddd] text-center text-[22px] outline-none focus:border-[#7fcf7f] max-sm:w-10"
            />
          ))}
        </div>
        <p className="mt-2 h-5 text-[15px] text-danger">{error}</p>

        <div className="mt-6 flex items-center justify-center gap-10 text-[17px]">
          <span className="text-[#555]">Resend?</span>
          {remaining > 0 ? (
            <span className="text-[#7fcf7f]">RESEND IN {mmss}</span>
          ) : (
            <button type="button" onClick={resend} className="cursor-pointer text-btn-strong hover:underline">
              RESEND
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={verify}
          disabled={busy}
          className="mt-10 w-[160px] cursor-pointer rounded-[3px] bg-btn-strong py-3 text-[18px] text-white shadow-md disabled:opacity-60"
        >
          {busy ? "…" : "VERIFY"}
        </button>
      </div>
    </div>
  );
}
