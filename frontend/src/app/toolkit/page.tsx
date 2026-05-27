import Link from "next/link";
import { UtilityPage } from "@/components/utility-page";

export default function ToolkitPage() {
  return (
    <UtilityPage
      title="AI Teacher's Toolkit"
      description="The demo toolkit focuses on the AI assessment creator workflow. Start from assignment creation to generate, review, regenerate, and export a structured paper."
    >
      <Link href="/assignments/create" className="btn-secondary">
        Create Assignment
      </Link>
    </UtilityPage>
  );
}
