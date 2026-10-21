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
      "Visitors need to understand the branded and unbranded fuel programs, then find a clear route to ask about working with the company.",
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
    problem: "The site needs to introduce Thekuwa, Sel and Furandana, explain what the kitchen makes, and make the products the focus of the story.",
    contribution: "I'm designing and building the responsive pages, product illustrations and scroll animations. The design and development are still in progress.",
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
      "Visitors need one place to explore the company and open a separate page for each hydropower project, with its engineering and financial information.",
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
      "Managers need one interface for staff schedules, attendance records and time-off requests across store locations.",
    contribution:
      "I built the dashboard, attendance tracking and time-off approval flows with React, Node.js, Express and Supabase. The public preview uses demo data; its figures are not usage or performance results.",
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
    problem: "Construction teams need project details, vendor bids, contract status and upcoming work together instead of spread across separate views.",
    contribution: "I'm building the project and vendor pages, bidding and contract workflows, dashboard and calendar with Next.js and PostgreSQL. It is still in development, and the screenshots use demo data.",
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
      "Visitors need to find the right business, understand the group and reach a clear partnership enquiry route.",
    contribution:
      "I built the company pages, business navigation, partnership enquiry interface and news section.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    metrics: [],
    href: "https://www.lama.group/",
    media: "/work/lama-group.jpg",
  },
];
