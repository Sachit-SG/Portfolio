export type Project = {
  slug: string;
  name: string;
  type: string;
  year: string;
  role: string;
  blurb: string;
  problem: string;
  contribution: string;
  stack: string[];
  metrics: { label: string; value: string }[];
  href?: string;
  media: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaCaption?: string;
  status?: string;
};

export const projects: Project[] = [
  {
    slug: "lama-fuel",
    name: "Lama Fuel",
    type: "Company website",
    year: "2026",
    role: "Full Stack Developer",
    blurb:
      "A website for a Texas fuel supplier, covering branded and unbranded fuel programs and partnership enquiries.",
    problem:
      "Introduce the fuel programs and give prospective partners a way to enquire about working with the company.",
    contribution:
      "I built the website's pages for fuel programs, services and partnership enquiries using Next.js.",
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Vercel"],
    metrics: [],
    href: "https://la-ma-fuel.vercel.app/",
    media: "/work/lama-fuel-website.png",
    mediaWidth: 3024,
    mediaHeight: 1738,
  },
  {
    slug: "thekuwa",
    name: "Thekuwa",
    type: "Food & brand website",
    year: "2026",
    role: "Design & Frontend Development",
    blurb: "A website for a small-batch Nepali kitchen selling Thekuwa, Sel and Furandana.",
    problem: "Introduce the three foods, their ingredients and the kitchen behind them.",
    contribution: "I'm designing and building the responsive pages, product illustrations and scroll animations. The site is still in development.",
    stack: ["HTML", "CSS", "JavaScript", "GSAP"],
    metrics: [],
    status: "Design in development",
    media: "/work/thekuwa.png",
    mediaWidth: 1074,
    mediaHeight: 1258,
    mediaCaption: "Website design in development. Screenshot supplied by Sachit.",
  },
  {
    slug: "unitech-hydropower",
    name: "Unitech Hydropower",
    type: "Corporate website",
    year: "2026",
    role: "Full Stack Developer",
    blurb:
      "A company website with individual pages for its hydropower projects, including engineering and financial information.",
    problem:
      "Make the company's project information available in one place, with separate pages for each asset.",
    contribution:
      "I built the company pages and project detail views, organizing the engineering and financial information for each asset.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    metrics: [],
    href: "https://unitechhydropower.com.np/",
    media: "/work/unitech-hydropower.jpg",
  },
  {
    slug: "hr-management-system",
    name: "Retail HR",
    type: "Internal tool",
    year: "2025",
    role: "Full Stack Developer",
    blurb:
      "A staff dashboard for attendance, schedules and time-off requests across store locations.",
    problem:
      "Bring staff schedules, attendance records and leave requests into one interface for managers.",
    contribution:
      "I built the dashboard, attendance tracking and time-off approval flows with Node.js, Express and Supabase. The public screenshots use demo data; their figures are not usage or performance results.",
    stack: ["React", "Node.js", "Express", "Supabase", "PostgreSQL"],
    metrics: [],
    href: "https://hr-management-system-azure.vercel.app/",
    status: "Public preview · demo data",
    media: "/work/retail-hr-dashboard.png",
    mediaWidth: 3024,
    mediaHeight: 1736,
    mediaCaption: "Retail HR dashboard. Demo data cleared for public display.",
  },
  {
    slug: "qt-contracts",
    name: "QT Contracts",
    type: "Contract management system",
    year: "2026",
    role: "Full Stack Developer",
    blurb: "An internal tool for managing construction projects, bids, contracts and change orders.",
    problem: "Keep project details, contract status and upcoming work together for the people managing construction jobs.",
    contribution: "I'm building the project and vendor pages, bidding and contract workflows, dashboard and calendar with Next.js and PostgreSQL. The system is still in development; the screenshots show demo data.",
    stack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma"],
    metrics: [],
    status: "In development · internal system",
    media: "/work/qt-contracts.png",
    mediaWidth: 3024,
    mediaHeight: 1736,
    mediaCaption: "QT Contracts dashboard. Demo data cleared for public display.",
  },
  {
    slug: "lama-group",
    name: "Lama Group",
    type: "Corporate website",
    year: "2026",
    role: "Full Stack Developer",
    blurb:
      "A company website introducing Lama Group's businesses and directing visitors to partnership enquiries.",
    problem:
      "Help visitors find the relevant business, company information and contact route.",
    contribution:
      "I built the company pages, business navigation, partnership enquiry interface and news section.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    metrics: [],
    href: "https://www.lama.group/",
    media: "/work/lama-group.jpg",
  },
];
