interface SignatureDeclarationBoxProps {
  text: string;
  version: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}

const SignatureDeclarationBox = ({
  text,
  version,
  checked,
  onCheckedChange,
  disabled,
}: SignatureDeclarationBoxProps) => {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 dark:border-[#404854] dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Declaração de ciência
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          v{version}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{text}</p>
      <label className="mt-4 flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          disabled={disabled}
        />
        <span>
          Li e confirmo a declaração acima. Esta confirmação será registrada com data, hora,
          endereço IP e identificação do dispositivo.
        </span>
      </label>
    </div>
  );
};

export default SignatureDeclarationBox;
