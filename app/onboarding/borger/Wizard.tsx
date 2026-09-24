"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, ExternalLink } from "lucide-react";

import { Section } from "@/components/Section";
import { completeCitizenOnboarding, saveCitizenOnboardingStep, type OnboardingActionState } from "./actions";

type AnyRow = Record<string, any>;

export type CitizenOnboardingData = {
  employment: AnyRow | null;
  functionProfile: AnyRow[];
  contacts: AnyRow[];
  goals: AnyRow[];
  consents: AnyRow | null;
};

type FunctionArea = {
  key: string;
  label: string;
  category: string;
};

const steps = [
  "Velkomst",
  "Beskæftigelse og forløb",
  "Funktionsprofil",
  "Kontaktpersoner",
  "Partsrepræsentant",
  "Mål",
  "Samtykker",
  "Første dagbog"
];

const functionAreas: FunctionArea[] = [
  ...["Angst", "Depression", "Stress", "PTSD", "OCD", "Social angst", "Bipolar lidelse", "Andet"].map((label) => ({
    key: `mental_${slug(label)}`,
    label,
    category: "Psykisk"
  })),
  ...["ADHD", "ADD", "Autisme", "Tourette", "Andet"].map((label) => ({
    key: `neuro_${slug(label)}`,
    label,
    category: "Neurodivergens"
  })),
  ...["Smerter", "Migræne", "Træthed", "Søvnproblemer", "Kronisk sygdom", "Bevægelsesproblemer"].map((label) => ({
    key: `physical_${slug(label)}`,
    label,
    category: "Fysisk"
  })),
  ...[
    "Personlig pleje",
    "Transport",
    "Indkøb",
    "Madlavning",
    "Rengøring",
    "Struktur",
    "Overblik",
    "Økonomi",
    "Sociale relationer"
  ].map((label) => ({
    key: `daily_${slug(label)}`,
    label,
    category: "Hverdagsfunktion"
  }))
];

const severities = [
  { value: "light", label: "Let" },
  { value: "moderate", label: "Moderat" },
  { value: "severe", label: "Svær" },
  { value: "very_severe", label: "Meget svær" }
];

const contactTypes = [
  "Sagsbehandler",
  "Jobkonsulent",
  "Mentor",
  "Praktikvejleder",
  "Pårørende",
  "Anden kontaktperson"
];

const goals = [
  "Gennemføre praktik",
  "Komme i arbejde",
  "Starte uddannelse",
  "Mindske angst",
  "Mindske smerter",
  "Mere energi",
  "Bedre struktur",
  "Øge selvstændighed"
];

const practiceWeekdays = [
  { value: "monday", label: "Mandag" },
  { value: "tuesday", label: "Tirsdag" },
  { value: "wednesday", label: "Onsdag" },
  { value: "thursday", label: "Torsdag" },
  { value: "friday", label: "Fredag" },
  { value: "saturday", label: "Lørdag" },
  { value: "sunday", label: "Søndag" }
];

const initialState: OnboardingActionState = {
  ok: false,
  message: null
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace("æ", "ae")
    .replace("ø", "oe")
    .replace("å", "aa")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function groupedAreas() {
  return functionAreas.reduce<Record<string, FunctionArea[]>>((groups, area) => {
    groups[area.category] = [...(groups[area.category] ?? []), area];
    return groups;
  }, {});
}

function existingArea(data: CitizenOnboardingData, area: FunctionArea) {
  return data.functionProfile.find((item) => {
    const label = item.function_area ?? item.area ?? item.label;
    const category = item.category ?? item.function_category;
    return label === area.label && (!category || category === area.category);
  });
}

function existingContact(data: CitizenOnboardingData, contactType: string) {
  return data.contacts.find((item) => item.contact_type === contactType);
}

export function CitizenOnboardingWizard({
  citizenName,
  initialStep,
  data
}: {
  citizenName: string;
  initialStep: number;
  data: CitizenOnboardingData;
}) {
  const [state, formAction, isPending] = useActionState(saveCitizenOnboardingStep, initialState);
  const [currentStep, setCurrentStep] = useState(Math.min(Math.max(initialStep, 1), 8));
  const areasByCategory = useMemo(groupedAreas, []);

  useEffect(() => {
    if (state.ok && state.nextStep) {
      setCurrentStep(state.nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.ok, state.nextStep]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-black/60">Borger Onboarding 1.0</p>
        <h1 className="mt-2 text-3xl font-semibold text-funktion-blue">Velkommen, {citizenName}</h1>
        <p className="mt-2 max-w-3xl leading-7 text-black/70">
          Udfyld de vigtigste oplysninger, så Favn360 kan give et samlet overblik fra første dag.
        </p>
      </div>

      <ol className="grid gap-2 md:grid-cols-4">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isDone = currentStep > stepNumber;

          return (
            <li
              key={label}
              className={`rounded border px-3 py-3 text-sm ${
                isActive
                  ? "border-funktion-blue bg-funktion-pale text-funktion-blue"
                  : isDone
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-funktion-line bg-white text-black/65"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold">
                {isDone ? <Check className="h-4 w-4" /> : <span>{stepNumber}</span>}
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {currentStep === 1 ? (
        <StepForm step={1} action={formAction} state={state} isPending={isPending}>
          <Section title="Velkomst">
            <p className="leading-7 text-black/75">
              Onboardingen samler oplysninger om praktik, funktionsområder, kontaktpersoner, mål og samtykker.
            </p>
          </Section>
        </StepForm>
      ) : null}

      {currentStep === 2 ? (
        <StepForm step={2} action={formAction} state={state} isPending={isPending} onBack={() => setCurrentStep(1)}>
          <Section title="Beskæftigelse og forløb">
            <Checkbox name="in_practice" label="Jeg er i praktik" defaultChecked={Boolean(data.employment?.in_practice)} />
            <fieldset className="grid gap-3">
              <legend className="font-medium text-funktion-blue">Praktikdage</legend>
              <p className="text-sm leading-6 text-black/70">
                Vælg de ugedage, hvor du typisk er i praktik. Favn360 opretter automatisk praktik-aftaler i kalenderen for perioden.
              </p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {practiceWeekdays.map((weekday) => (
                  <Checkbox
                    key={weekday.value}
                    name="practice_weekdays"
                    value={weekday.value}
                    label={weekday.label}
                    defaultChecked={Boolean(data.employment?.practice_weekdays?.includes(weekday.value))}
                  />
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Praktiksted" name="practice_company" defaultValue={data.employment?.practice_company} />
              <Input label="Kontaktperson i praktik" name="practice_contact_person" defaultValue={data.employment?.practice_contact_person} />
              <Input label="Startdato" name="practice_start_date" type="date" defaultValue={data.employment?.practice_start_date} />
              <Input label="Slutdato" name="practice_end_date" type="date" defaultValue={data.employment?.practice_end_date} />
              <Input
                label="Timer pr. uge"
                name="practice_hours_per_week"
                type="number"
                step="0.5"
                defaultValue={data.employment?.practice_hours_per_week}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Checkbox name="job_clarification" label="Jobafklaring" defaultChecked={Boolean(data.employment?.job_clarification)} />
              <Checkbox name="resource_program" label="Ressourceforløb" defaultChecked={Boolean(data.employment?.resource_program)} />
              <Checkbox name="sick_leave" label="Sygemeldt" defaultChecked={Boolean(data.employment?.sick_leave)} />
              <Checkbox name="cash_benefits" label="Kontanthjælp" defaultChecked={Boolean(data.employment?.cash_benefits)} />
              <Checkbox name="sickness_benefits" label="Sygedagpenge" defaultChecked={Boolean(data.employment?.sickness_benefits)} />
              <Checkbox name="disability_pension" label="Førtidspension" defaultChecked={Boolean(data.employment?.disability_pension)} />
            </div>
          </Section>
        </StepForm>
      ) : null}

      {currentStep === 3 ? (
        <StepForm step={3} action={formAction} state={state} isPending={isPending} onBack={() => setCurrentStep(2)}>
          <Section title="Funktionsprofil">
            {Object.entries(areasByCategory).map(([category, areas]) => (
              <div key={category} className="grid gap-3 rounded border border-funktion-line p-4">
                <h3 className="font-semibold text-funktion-blue">{category}</h3>
                <div className="grid gap-3">
                  {areas.map((area) => {
                    const existing = existingArea(data, area);

                    return (
                      <div key={area.key} className="grid gap-3 rounded border border-funktion-line p-3">
                        <Checkbox name="function_area" value={area.key} label={area.label} defaultChecked={Boolean(existing)} />
                        <input type="hidden" name={`label_${area.key}`} value={area.label} />
                        <input type="hidden" name={`category_${area.key}`} value={area.category} />
                        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                          <label className="grid gap-2">
                            <span className="text-sm font-medium">Sværhedsgrad</span>
                            <select
                              name={`severity_${area.key}`}
                              defaultValue={existing?.severity ?? "moderate"}
                              className="focus-ring rounded border border-funktion-line px-4 py-3"
                            >
                              {severities.map((severity) => (
                                <option key={severity.value} value={severity.value}>
                                  {severity.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <Input label="Beskrivelse" name={`description_${area.key}`} defaultValue={existing?.description} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Section>
        </StepForm>
      ) : null}

      {currentStep === 4 ? (
        <StepForm step={4} action={formAction} state={state} isPending={isPending} onBack={() => setCurrentStep(3)}>
          <Section title="Kontaktpersoner">
            {contactTypes.map((contactType) => {
              const key = slug(contactType);
              const contact = existingContact(data, contactType);

              return (
                <div key={contactType} className="grid gap-4 rounded border border-funktion-line p-4">
                  <input type="hidden" name="contact_key" value={key} />
                  <input type="hidden" name={`contact_type_${key}`} value={contactType} />
                  <h3 className="font-semibold text-funktion-blue">{contactType}</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input label="Navn" name={`name_${key}`} defaultValue={contact?.name} />
                    <Input label="Telefon" name={`phone_${key}`} defaultValue={contact?.phone} />
                    <Input label="Email" name={`email_${key}`} type="email" defaultValue={contact?.email} />
                  </div>
                  <TextArea label="Noter" name={`notes_${key}`} defaultValue={contact?.notes} />
                </div>
              );
            })}
          </Section>
        </StepForm>
      ) : null}

      {currentStep === 5 ? (
        <StepForm step={5} action={formAction} state={state} isPending={isPending} onBack={() => setCurrentStep(4)}>
          <Section title="Partsrepræsentant">
            <fieldset className="grid gap-3">
              <legend className="font-medium">Har du en partsrepræsentant?</legend>
              <label className="flex items-center gap-3 rounded border border-funktion-line px-4 py-3">
                <input type="radio" name="has_representative" value="yes" />
                <span>Ja</span>
              </label>
              <label className="flex items-center gap-3 rounded border border-funktion-line px-4 py-3">
                <input type="radio" name="has_representative" value="no" defaultChecked />
                <span>Nej</span>
              </label>
            </fieldset>
            <Link
              href="/find-partsrepraesentant"
              className="focus-ring inline-flex w-fit items-center gap-2 rounded border border-funktion-line px-5 py-3 font-semibold text-funktion-blue hover:bg-funktion-pale"
            >
              Inviter partsrepræsentant til Favn360
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Section>
        </StepForm>
      ) : null}

      {currentStep === 6 ? (
        <StepForm step={6} action={formAction} state={state} isPending={isPending} onBack={() => setCurrentStep(5)}>
          <Section title="Mål">
            <div className="grid gap-3 md:grid-cols-2">
              {goals.map((goal) => (
                <Checkbox
                  key={goal}
                  name="goal"
                  value={goal}
                  label={goal}
                  defaultChecked={data.goals.some((item) => item.goal === goal || item.goal_text === goal)}
                />
              ))}
            </div>
            <TextArea
              label="Eget mål"
              name="custom_goal"
              defaultValue={data.goals.find((item) => item.custom_goal)?.custom_goal}
            />
          </Section>
        </StepForm>
      ) : null}

      {currentStep === 7 ? (
        <StepForm step={7} action={formAction} state={state} isPending={isPending} onBack={() => setCurrentStep(6)}>
          <Section title="Privatliv og valg">
            <Checkbox
              name="data_processing"
              label="Jeg har læst privatlivspolitikken (dette er en kvittering, ikke et generelt samtykke til al behandling)"
              defaultChecked={Boolean(data.consents?.data_processing)}
              required
            />
            <Checkbox
              name="representative_sharing"
              label="Jeg ønsker deling med en aktivt tilknyttet partsrepræsentant"
              defaultChecked={Boolean(data.consents?.representative_sharing)}
            />
            <Checkbox
              name="ai_analysis"
              label="Jeg ønsker frivilligt Favn360 Analyse med AI; valget kan trækkes tilbage"
              defaultChecked={Boolean(data.consents?.ai_analysis)}
            />
            <Checkbox name="notifications" label="Jeg ønsker valgfrie notifikationer" defaultChecked={Boolean(data.consents?.notifications)} />
          </Section>
        </StepForm>
      ) : null}

      {currentStep === 8 ? (
        <Section title="Første dagbog">
          <p className="leading-7 text-black/75">Vil du oprette din første dagbog nu?</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <form action={completeCitizenOnboarding}>
              <input type="hidden" name="redirect_to" value="/dagbog" />
              <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded bg-funktion-blue px-6 py-3 font-semibold text-white sm:w-auto">
                Opret første dagbog
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
            <form action={completeCitizenOnboarding}>
              <input type="hidden" name="redirect_to" value="/dashboard/borger" />
              <button className="focus-ring inline-flex w-full items-center justify-center rounded border border-funktion-line px-6 py-3 font-semibold text-funktion-blue hover:bg-funktion-pale sm:w-auto">
                Spring over
              </button>
            </form>
          </div>
        </Section>
      ) : null}
    </div>
  );
}

function StepForm({
  step,
  action,
  state,
  isPending,
  onBack,
  children
}: {
  step: number;
  action: (payload: FormData) => void;
  state: OnboardingActionState;
  isPending: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <form action={action} className="grid gap-6">
      <input type="hidden" name="step" value={step} />
      {children}
      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-funktion-line bg-white py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {state.message ? (
            <p className={`rounded border px-4 py-3 text-sm ${state.ok ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              {state.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded border border-funktion-line px-5 py-3 font-semibold text-funktion-blue hover:bg-funktion-pale"
            >
              <ChevronLeft className="h-5 w-5" />
              Tilbage
            </button>
          ) : null}
          <button
            disabled={isPending}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded bg-funktion-blue px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Gemmer..." : step === 7 ? "Gem og gå til afslutning" : "Gem og fortsæt"}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
}

function Input({
  label,
  name,
  type = "text",
  defaultValue,
  step
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  step?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? ""}
        className="focus-ring rounded border border-funktion-line px-4 py-3"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue ?? ""}
        className="focus-ring rounded border border-funktion-line px-4 py-3"
      />
    </label>
  );
}

function Checkbox({
  name,
  label,
  value = "on",
  defaultChecked = false,
  required = false
}: {
  name: string;
  label: string;
  value?: string;
  defaultChecked?: boolean;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded border border-funktion-line px-4 py-3">
      <input name={name} value={value} type="checkbox" defaultChecked={defaultChecked} required={required} />
      <span>{label}</span>
    </label>
  );
}
