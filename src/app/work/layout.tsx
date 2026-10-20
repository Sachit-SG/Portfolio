import WorkNav from "@/components/WorkNav";
import WorkMotion from "@/components/WorkMotion";
import Contact from "@/components/Contact";
import styles from "./work.module.css";

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return <WorkMotion><WorkNav />{children}<div className={styles.contactFooter}><Contact railInset={false} /></div></WorkMotion>;
}
