import { AssignmentOutput } from "@/components/assignment-output";

export default function AssignmentOutputPage({ params }: { params: { id: string } }) {
  return <AssignmentOutput id={params.id} />;
}
