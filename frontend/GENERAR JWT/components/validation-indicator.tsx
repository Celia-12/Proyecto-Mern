import { Check, X } from "lucide-react";
import type { ValidationRule } from "@/lib/validation";

interface ValidationIndicatorProps {
  rules: ValidationRule[];
  value: string;
  show: boolean;
}

export function ValidationIndicator({
  rules,
  value,
  show,
}: ValidationIndicatorProps) {
  if (!show) return null;

  return (
    <ul className="mt-2 flex flex-col gap-1.5" role="list" aria-label="Reglas de validación">
      {rules.map((rule) => {
        const passes = value.length > 0 && rule.test(value);
        return (
          <li
            key={rule.id}
            className="flex items-center gap-2 text-xs transition-colors duration-200"
          >
            {passes ? (
              <Check className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            )}
            <span
              className={
                passes ? "text-success" : "text-muted-foreground"
              }
            >
              {rule.label}
            </span>
            <span className="sr-only">
              {passes ? "cumplido" : "pendiente"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
