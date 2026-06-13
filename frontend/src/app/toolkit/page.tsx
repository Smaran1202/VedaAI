import Link from "next/link";
import { UtilityPage } from "@/components/layout/utility-page";

export default function ToolkitPage() {
  return (
    <UtilityPage
      title="AI Teacher's Toolkit"
      description="The toolkit will centralize AI teaching workflows. Start from assignment creation to generate, review, regenerate, and export a structured paper."
    >
      <Link href="/assignments/create" className="btn-secondary">
        Create Assignment
      </Link>
    </UtilityPage>
  );
}
