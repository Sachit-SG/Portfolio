/**
 * Self-assessed confidence, reviewed and confirmed by Sachit.
 *
 * SCALE — stated on the chart itself, deliberately: "confidence shipping this
 * to production, unsupervised (1-5)". A naked percentage means nothing and
 * invites an interviewer to disprove it; a labelled scale reads as someone who
 * knows what a rating is for.
 *
 * The Three.js 1 is kept on purpose. A chart where everything scores 4-5 reads
 * as self-flattery and gets discounted wholesale — one honest low score is what
 * makes the rest credible.
 *
 * `evidence` is not decoration: every rating traces to shipped work, so the
 * numbers can be defended in an interview rather than just asserted.
 */
export type Skill = {
  label: string;
  value: number; // 1-5
  evidence: string;
};

/** The radial. Ordered to lead with the backend story the hero claims. */
export const coreSkills: Skill[] = [
  { label: "Next.js", value: 5, evidence: "4 of 5 shipped systems" },
  { label: "Node · Express", value: 4, evidence: "internal APIs, Retail HR" },
  { label: "PostgreSQL", value: 4, evidence: "schema design + migrations" },
  { label: "Auth · JWT · SSO", value: 4, evidence: "SSO across two codebases" },
];

/** The line graph. */
export const supportingSkills: Skill[] = [
  { label: "TypeScript", value: 4, evidence: "4 of 5 systems" },
  { label: "React", value: 4, evidence: "every frontend shipped" },
  { label: "UI systems", value: 4, evidence: "2 years design before dev" },
  { label: "Prisma", value: 3, evidence: "Lama Fuel" },
  { label: "Supabase", value: 3, evidence: "Retail HR" },
  { label: "Three.js", value: 1, evidence: "not shipped" },
];

export const SKILL_SCALE_LABEL =
  "Confidence shipping to production · self-assessed 1–5";
