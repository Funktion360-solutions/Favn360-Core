type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
};

export function TextAreaField({ label, name, defaultValue, placeholder, required }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="font-medium text-black">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="focus-ring min-h-28 rounded border border-funktion-line bg-white px-4 py-3 leading-7 text-black"
      />
    </label>
  );
}

export function InputField({ label, name, defaultValue, placeholder, required }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="font-medium text-black">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
      />
    </label>
  );
}

export function TimeField({ label, name, defaultValue }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="font-medium text-black">{label}</span>
      <input
        type="time"
        name={name}
        defaultValue={defaultValue ?? ""}
        className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
      />
    </label>
  );
}

export function NumberField({ label, name, defaultValue, required }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="font-medium text-black">{label}</span>
      <input
        type="number"
        min={0}
        max={10}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="focus-ring rounded border border-funktion-line bg-white px-4 py-3 text-black"
      />
    </label>
  );
}

export function CheckboxGroup({
  legend,
  name,
  options,
  selected = []
}: {
  legend: string;
  name: string;
  options: string[];
  selected?: string[];
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="font-medium text-black">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 rounded border border-funktion-line px-4 py-3">
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selected.includes(option)}
              className="h-5 w-5 accent-funktion-blue"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function RadioGroup({
  legend,
  name,
  defaultValue = "false"
}: {
  legend: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="font-medium text-black">{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {[
          ["true", "Ja"],
          ["false", "Nej"]
        ].map(([value, label]) => (
          <label key={value} className="flex items-center gap-3 rounded border border-funktion-line px-4 py-3">
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
              className="h-5 w-5 accent-funktion-blue"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
