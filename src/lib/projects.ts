export type Project = {
  slug: string;
  name: string;
  year: string;
  role: string;
  blurb: string;
  problem: string;
  contribution: string;
  stack: string[];
  metrics: { label: string; value: string }[];
  href: string;
  media: string;
};

export const projects: Project[] = [
  {
    slug: "lama-fuel",
    name: "Lama Fuel",
    year: "2026",
    role: "Full Stack Developer",
    blurb:
      "Real-time monitoring and ordering platform for a fuel supply operator running branded and unbranded programs across Texas.",
    problem:
      "Independent operators needed dispatch visibility and self-serve ordering across six fuel types instead of phone-and-fax coordination.",
    contribution:
      "Built the ordering and dispatch-visibility flows on Next.js and PostgreSQL, sole developer end to end.",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Vercel"],
    metrics: [
      { label: "Fuel types", value: "6" },
      { label: "Role", value: "Sole dev" },
    ],
    href: "https://la-ma-fuel.vercel.app/",
    media: "/work/lama-fuel-poster.jpg",
  },
  {
    slug: "lama-convenience",
    name: "Lama Convenience",
    year: "2026",
    role: "Full Stack Developer",
    blurb:
      "Consumer-facing site for a 24/7 convenience store chain — deals, rewards, and store locator for the retail brand under Lama Group.",
    problem:
      "The chain needed a public storefront that could carry promos, a rewards program, and store lookup without a CMS team behind it.",
    contribution:
      "Shipped the storefront, rewards messaging, and blog scaffolding on Next.js.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    metrics: [
      { label: "Locations", value: "24/7" },
      { label: "Rewards", value: "$1 = 1pt" },
    ],
    href: "https://lamaconvenience.org/",
    media: "/work/lama-convenience-poster.jpg",
  },
  {
    slug: "unitech-hydropower",
    name: "Unitech Hydropower",
    year: "2026",
    role: "Full Stack Developer",
    blurb:
      "Corporate site for a run-of-river hydropower developer in eastern Nepal, presenting live engineering and financial data per project.",
    problem:
      "Investors and regulators needed verifiable per-project specs — head, discharge, revenue, IRR — not a generic corporate brochure.",
    contribution:
      "Built the project data architecture and detail views covering civil, electro-mechanical, and financial breakdowns per asset.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    metrics: [
      { label: "Portfolio", value: "20.8 MW" },
      { label: "Operational asset", value: "5.8 MW" },
    ],
    href: "https://unitechhydropower.com/",
    media: "/work/unitech-poster.jpg",
  },
  {
    slug: "hr-management-system",
    name: "Retail HR",
    year: "2025",
    role: "Full Stack Developer",
    blurb:
      "Internal staff management portal for a multi-location retail operator — attendance, scheduling, and time-off in one dashboard.",
    problem:
      "HR lookups across locations were handled by hand; managers had no live view of who was scheduled, clocked in, or late.",
    contribution:
      "Built the dashboard, attendance tracking, and time-off approval flows on Node, Express, and Supabase.",
    stack: ["React", "Node.js", "Express", "Supabase", "PostgreSQL"],
    metrics: [
      { label: "Employees tracked", value: "341" },
      { label: "On-time attendance", value: "85.2%" },
    ],
    href: "https://hr-management-system-azure.vercel.app/",
    media: "/work/hr-system-poster.jpg",
  },
  {
    slug: "lama-group",
    name: "Lama Group",
    year: "2026",
    role: "Full Stack Developer",
    blurb:
      "Corporate parent site tying together Lama's leasing, wholesale, fuel, construction, and tech divisions under one brand.",
    problem:
      "Five distinct business lines needed a single entry point that routes partners and press to the right division.",
    contribution:
      "Built the corporate site structure, partnership intake, and news aggregation across divisions.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    metrics: [
      { label: "Divisions", value: "5" },
      { label: "Experience", value: "20+ yrs" },
    ],
    href: "https://www.lama.group/",
    media: "/work/lama-group-poster.jpg",
  },
];
