"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";

type ReferenceStyle = {
  id: string;
  name: string;
  description: string | null;
  referenceImageUrl: string;
};

type Generation = {
  id: string;
  status: "pending" | "processing" | "complete" | "failed";
  sourceImageUrl: string;
  resultImageUrl: string | null;
  confidenceScore: number | null;
};

type Step = "upload" | "style" | "result";

export default function HomeClient() {
  const user = useUser();
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [styles, setStyles] = useState<ReferenceStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/styles")
      .then((res) => res.json())
      .then(setStyles)
      .catch(() => setError("Couldn't load styles"));
  }, []);

  function handleFileSelected(file: File) {
    setSourceFile(file);
    setSourcePreview(URL.createObjectURL(file));
    setStep("style");
  }

  async function handleGenerate() {
    if (!sourceFile || !selectedStyleId) return;
    if (!user) {
      router.push("/handler/sign-in");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const formData = new FormData();
    formData.append("sourceImage", sourceFile);
    formData.append("referenceStyleId", selectedStyleId);

    try {
      const res = await fetch("/api/generations", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Generation failed");
      }
      const result: Generation = await res.json();
      setGeneration(result);
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRegenerate() {
    if (!generation) return;
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/generations/${generation.id}/regenerate`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Regeneration failed");
      }
      const result: Generation = await res.json();
      setGeneration(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#e8734a" }}>
          Remynt
        </h1>
        {user ? (
          <span className="text-sm text-neutral-500">{user.primaryEmail}</span>
        ) : (
          <Link href="/handler/sign-in" className="text-sm font-medium underline">
            Sign in
          </Link>
        )}
      </header>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {step === "upload" && (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-neutral-600">
            Upload a photo — solo, couple, or family — and give it a new look
            while staying recognizably you.
          </p>
          <label className="w-full cursor-pointer rounded-xl border-2 border-dashed border-neutral-300 px-6 py-12 text-center hover:border-neutral-400">
            <span className="font-medium">Tap to upload a photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
              }}
            />
          </label>
        </section>
      )}

      {step === "style" && sourcePreview && (
        <section className="flex flex-1 flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sourcePreview} alt="Your photo" className="aspect-square w-full rounded-xl object-cover" />
          <h2 className="font-semibold">Choose a style</h2>
          <div className="grid grid-cols-2 gap-3">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyleId(style.id)}
                className={`overflow-hidden rounded-lg border-2 text-left ${
                  selectedStyleId === style.id ? "border-[#e8734a]" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={style.referenceImageUrl}
                  alt={style.name}
                  className="aspect-square w-full object-cover"
                />
                <p className="px-2 py-1 text-sm font-medium">{style.name}</p>
              </button>
            ))}
          </div>
          <button
            disabled={!selectedStyleId || isGenerating}
            onClick={handleGenerate}
            className="mt-auto w-full rounded-xl bg-[#e8734a] py-3 font-semibold text-white disabled:opacity-40"
          >
            {isGenerating ? "Generating…" : "Generate"}
          </button>
        </section>
      )}

      {step === "result" && generation && (
        <section className="flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={generation.sourceImageUrl} alt="Before" className="aspect-square w-full rounded-xl object-cover" />
            {generation.resultImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={generation.resultImageUrl} alt="After" className="aspect-square w-full rounded-xl object-cover" />
            )}
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <a
              href={generation.resultImageUrl ?? "#"}
              download
              className="w-full rounded-xl bg-[#e8734a] py-3 text-center font-semibold text-white"
            >
              Download
            </a>
            <button
              disabled={isGenerating}
              onClick={handleRegenerate}
              className="w-full rounded-xl border border-neutral-300 py-3 font-semibold disabled:opacity-40"
            >
              {isGenerating ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
