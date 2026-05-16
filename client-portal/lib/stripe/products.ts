export type ProductKey =
  | "library_basics"
  | "library_standard"
  | "library_advanced"
  | "library_all_access"
  | "tutoring_single"
  | "tutoring_5h"
  | "tutoring_10h"

export interface ProductConfig {
  key: ProductKey
  name: string
  description: string
  price: number
  type: "one_time" | "recurring"
  metadata?: Record<string, string>
}

export const PRODUCTS: Record<ProductKey, ProductConfig> = {
  library_basics: {
    key: "library_basics",
    name: "Statistics Library – Basics",
    description: "Entscheidungsbaum, Diktionär Abi, Dossiers 10–13, Prüfungen 10–13",
    price: 900,
    type: "one_time",
    metadata: { access: "library", tier: "basics" },
  },
  library_standard: {
    key: "library_standard",
    name: "Statistics Library – Standard",
    description: "Basics + Bachelor-Diktionär, Code-Einführungen, Dossiers 10–37, alle Prüfungen",
    price: 2400,
    type: "one_time",
    metadata: { access: "library", tier: "standard" },
  },
  library_advanced: {
    key: "library_advanced",
    name: "Statistics Library – Advanced",
    description: "Standard + Master-Diktionär, Master-Code, Dossiers 38–42, Klausurkonstruktionen",
    price: 3900,
    type: "one_time",
    metadata: { access: "library", tier: "advanced" },
  },
  library_all_access: {
    key: "library_all_access",
    name: "Statistics Library – All-Access",
    description: "Alle Materialien inkl. PhD, EN-Versionen & Literaturverzeichnis",
    price: 5900,
    type: "one_time",
    metadata: { access: "library", tier: "all_access" },
  },
  tutoring_single: {
    key: "tutoring_single",
    name: "Einzelsitzung Nachhilfe",
    description: "1 Stunde individuelle Betreuung",
    price: 4500,
    type: "one_time",
    metadata: { access: "tutoring", hours: "1" },
  },
  tutoring_5h: {
    key: "tutoring_5h",
    name: "5-Stunden Paket Nachhilfe",
    description: "5 Stunden Betreuung zum Vorzugspreis",
    price: 20250,
    type: "one_time",
    metadata: { access: "tutoring", hours: "5" },
  },
  tutoring_10h: {
    key: "tutoring_10h",
    name: "10-Stunden Paket Nachhilfe",
    description: "10 Stunden Betreuung mit maximalem Rabatt",
    price: 38250,
    type: "one_time",
    metadata: { access: "tutoring", hours: "10" },
  },
}
