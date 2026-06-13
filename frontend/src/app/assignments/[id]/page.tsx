import { AssignmentOutput } from "@/components/assignments/assignment-output";

export default function AssignmentOutputPage({ params }: { params: { id: string } }) {
  return <AssignmentOutput id={params.id} />;
}
