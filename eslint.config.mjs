import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const moduleBoundary = {
  group: ["@/modules/*/*", "@/modules/*/**"],
  message:
    "Importez un module uniquement via @/modules/<nom> (index.ts). Voir docs/conventions.md.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "src/generated/**",
    "next-env.d.ts",
  ]),
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/lib/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [moduleBoundary] }],
    },
  },
  {
    files: ["src/platform/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules", "@/modules/**"],
              message: "platform/ ne dépend pas des modules métier.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app", "@/app/**", "@/components", "@/components/**"],
              message: "Un module ne dépend pas de app/ ni de components/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/proxy.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules", "@/modules/**"],
              message:
                "Le proxy Edge n’importe que @/platform/session — pas Prisma, pas de modules.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
