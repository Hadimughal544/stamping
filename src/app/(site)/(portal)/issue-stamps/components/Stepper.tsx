const steps = ["Basic Information", "Confirmation"];

export function Stepper({ current }: { current: 0 | 1 }) {
  return (
    <div className="relative mx-auto mb-8 max-w-[1460px] pt-[70px]">
      {/* arrow band */}
      <div
        className="h-[48px] bg-[#d3e8cf]"
        style={{ clipPath: "polygon(0 0, calc(100% - 36px) 0, 100% 50%, calc(100% - 36px) 100%, 0 100%, 16px 50%)" }}
      />
      {steps.map((label, i) => (
        <div
          key={label}
          className={`absolute top-0 flex flex-col items-center ${i === 0 ? "left-0" : "right-[36px]"}`}
        >
          <div className="relative w-[146px] rounded-[3px] bg-white px-3 py-2 text-center font-serif text-[16px] leading-[19px] text-[#333] shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
            {label}
            <span className="absolute -bottom-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white shadow-[2px_2px_2px_rgba(0,0,0,0.08)]" />
          </div>
          <span
            className={`mt-[21px] h-[32px] w-[32px] rounded-full border-[3px] border-[#3fb64a] ${
              i <= current ? "bg-[#3fb64a] shadow-[inset_0_0_0_4px_#d3e8cf]" : "bg-[#d3e8cf]"
            }`}
          />
        </div>
      ))}
    </div>
  );
}
