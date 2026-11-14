import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Frontières d'architecture : shared → features → routes, jamais dans l'autre sens.
const forbid = (patterns, message) => ({ "no-restricted-imports": ["error", { patterns: [{ group: patterns, message }] }] });

export default tseslint.config(
  { ignores: ["build", ".react-router", ".vercel", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["app/shared/**"], rules: forbid(["~/features/*", "~/routes/*"], "shared ne dépend ni des fonctionnalités ni des routes.") },
  { files: ["app/features/**"], rules: forbid(["~/routes/*"], "Une fonctionnalité ne dépend pas des routes.") },
  { files: ["app/features/*/model/**"], rules: forbid(["react", "react-router", "~/routes/*", "**/components/*", "**/api/*"], "Le modèle est du TypeScript pur : ni React, ni accès aux données.") },
  { files: ["scripts/**"], languageOptions: { globals: { console: "readonly", fetch: "readonly", URL: "readonly", URLSearchParams: "readonly" } } },
);
