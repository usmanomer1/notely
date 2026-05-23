"use client";

import { useMutation, useQuery } from "convex/react";
import { Key, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";

type WorkspaceSetupProps = {
  mode?: "gate" | "settings";
  onComplete?: () => void;
  onClose?: () => void;
};

export function WorkspaceSetup({
  mode = "gate",
  onComplete,
  onClose,
}: WorkspaceSetupProps) {
  const status = useQuery(api.integrations.getSetupStatus);
  const saveIntegrations = useMutation(api.integrations.saveIntegrations);
  const acknowledgePlatformKeys = useMutation(api.integrations.acknowledgePlatformKeys);

  const [openrouterKey, setOpenrouterKey] = useState("");
  const [browserbaseKey, setBrowserbaseKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("anthropic/claude-sonnet-4");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!status) {
      return;
    }
    setOpenrouterModel(status.openrouterModel);
  }, [status]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload: {
        openrouterApiKey?: string;
        browserbaseApiKey?: string;
        openrouterModel?: string;
      } = { openrouterModel };

      if (openrouterKey.trim()) {
        payload.openrouterApiKey = openrouterKey.trim();
      } else if (!status?.hasUserOpenrouterKey) {
        setError("OpenRouter API key is required.");
        setSaving(false);
        return;
      }

      if (browserbaseKey.trim()) {
        payload.browserbaseApiKey = browserbaseKey.trim();
      } else if (!status?.hasUserBrowserbaseKey) {
        setError("Browserbase API key is required.");
        setSaving(false);
        return;
      }

      await saveIntegrations(payload);
      setOpenrouterKey("");
      setBrowserbaseKey("");
      onComplete?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save keys.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUsePlatformKeys() {
    setError(null);
    setSaving(true);
    try {
      await acknowledgePlatformKeys({});
      onComplete?.();
    } catch (platformError) {
      setError(
        platformError instanceof Error
          ? platformError.message
          : "Could not use platform keys.",
      );
    } finally {
      setSaving(false);
    }
  }

  const isGate = mode === "gate";

  return (
    <div
      className={
        isGate
          ? "flex h-[100dvh] items-center justify-center bg-[#e5e2dc] px-4 py-8"
          : "fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4 py-8"
      }
    >
      <div className="w-full max-w-lg border border-[#cfc9bf] bg-white">
        <div className="border-b border-[#e7e3dc] bg-[#1c1917] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-amber-500" weight="duotone" />
            <p className="text-sm font-medium">
              {isGate ? "Set up your workspace" : "API keys"}
            </p>
          </div>
          <p className="mt-1 text-xs leading-5 text-stone-400">
            Notely is BYOK — your keys stay tied to your account and power the AI
            assistant and research tools.
          </p>
        </div>

        <form onSubmit={(event) => void handleSave(event)} className="space-y-5 p-5">
          <Field
            label="OpenRouter API key"
            hint="Powers the assistant LLM. Get one at openrouter.ai/keys"
            type="password"
            value={openrouterKey}
            onChange={setOpenrouterKey}
            placeholder={
              status?.openrouterMasked
                ? `Saved (${status.openrouterMasked})`
                : "sk-or-…"
            }
            required={!status?.hasUserOpenrouterKey && !status?.usingPlatformOpenrouter}
          />

          <Field
            label="OpenRouter model"
            hint="Optional — defaults to Claude Sonnet 4"
            value={openrouterModel}
            onChange={setOpenrouterModel}
            placeholder="anthropic/claude-sonnet-4"
          />

          <Field
            label="Browserbase API key"
            hint="Powers web search and page reading. Get one at browserbase.com/settings"
            type="password"
            value={browserbaseKey}
            onChange={setBrowserbaseKey}
            placeholder={
              status?.browserbaseMasked
                ? `Saved (${status.browserbaseMasked})`
                : "bb_live_…"
            }
            required={!status?.hasUserBrowserbaseKey && !status?.usingPlatformBrowserbase}
          />

          {error ? (
            <div className="flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-800">
              <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || status === undefined}
              className="bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {saving ? "Saving…" : isGate ? "Save and open workspace" : "Save keys"}
            </button>

            {status?.platformKeysAvailable ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleUsePlatformKeys()}
                className="border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-500 disabled:opacity-50"
              >
                Use server keys (dev)
              </button>
            ) : null}

            {!isGate && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-stone-500 transition hover:text-stone-800"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <p className="text-[11px] leading-5 text-stone-500">
            Keys are stored in your Convex database per user. They are never returned to
            the browser after saving. Leave a field blank to keep an existing key.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-stone-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1.5 w-full border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-amber-600"
      />
      <span className="mt-1 block text-[11px] leading-4 text-stone-500">{hint}</span>
    </label>
  );
}
