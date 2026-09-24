"use client";

import { useRef, useState } from "react";

type Props = {
  citizenId: string;
};

export function DocumentUpload({ citizenId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("andet");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  async function uploadDocument() {
    if (!file) return;

    setMessage("Uploader...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("citizenId", citizenId);
    formData.append("category", category);
    formData.append("title", title);

    const response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setMessage("Dokumentet kunne ikke uploades.");
      return;
    }

    setFile(null);
    setTitle("");
    setMessage("Dokumentet er uploadet.");
    window.location.reload();
  }

  return (
    <div className="grid gap-4 rounded border border-funktion-line p-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const droppedFile = event.dataTransfer.files?.[0];
          if (droppedFile) setFile(droppedFile);
        }}
        className="cursor-pointer rounded border-2 border-dashed border-funktion-line p-8 text-center"
      >
        <p className="font-semibold text-funktion-blue">
          Træk en fil hertil eller klik for at vælge
        </p>

        <p className="mt-2 text-sm text-black/60">
          PDF, JPEG og PNG på højst 10 MB.
        </p>

        {file ? (
          <p className="mt-4 text-sm font-medium">{file.name}</p>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          hidden
          onChange={(event) => {
            const selectedFile = event.target.files?.[0];
            if (selectedFile) setFile(selectedFile);
          }}
        />
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Titel på dokument"
        className="rounded border border-funktion-line px-4 py-3"
      />

      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="rounded border border-funktion-line px-4 py-3"
      >
        <option value="laege">Lægedokument</option>
        <option value="jobcenter">Jobcenter</option>
        <option value="praktik">Praktik</option>
        <option value="moede">Møde</option>
        <option value="afgoerelse">Afgørelse</option>
        <option value="andet">Andet</option>
      </select>

      <button
        type="button"
        onClick={uploadDocument}
        disabled={!file}
        className="w-fit rounded bg-funktion-blue px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        Upload dokument
      </button>

      {message ? <p className="text-sm text-black/70">{message}</p> : null}
    </div>
  );
}
