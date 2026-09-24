import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-funktion-pale px-4 py-10">
      <div className="mx-auto grid w-full max-w-md content-center gap-6">
        <div>
          <p className="text-3xl font-semibold text-funktion-blue">Favn360</p>
          <p className="mt-2 text-black/70">Digital dagbog og funktionsdokumentation</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
