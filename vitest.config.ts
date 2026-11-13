import { defineConfig } from "vitest/config";

// Config séparée de Vite : les tests du modèle n'ont pas besoin du plugin React Router.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { include: ["app/**/*.test.ts"] },
});
