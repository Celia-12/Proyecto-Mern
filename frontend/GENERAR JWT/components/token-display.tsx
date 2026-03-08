"use client";

import { useState } from "react";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TokenDisplayProps {
  token: string;
  email: string;
}

export function TokenDisplay({ token, email }: TokenDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Decode the JWT payload (base64url)
  const parts = token.split(".");
  let payload: Record<string, unknown> = {};
  if (parts.length === 3) {
    try {
      payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      payload = {};
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <ShieldCheck className="h-7 w-7 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-foreground text-balance text-center">
          Autenticación Exitosa
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Token JWT generado para <span className="text-foreground font-medium">{email}</span>
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            JWT Token
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-success" />
                <span className="text-success">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </>
            )}
          </Button>
        </div>
        <code className="block text-xs text-foreground/80 break-all font-mono leading-relaxed bg-secondary/50 rounded-md p-3 max-h-32 overflow-y-auto">
          {token}
        </code>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Payload Decodificado
        </span>
        <pre className="text-xs text-foreground/80 font-mono leading-relaxed bg-secondary/50 rounded-md p-3 overflow-x-auto">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div>
  );
}
