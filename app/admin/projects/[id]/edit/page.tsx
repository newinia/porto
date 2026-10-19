
import ProjectForm from "../../ProjectForm";
export const instant = false;

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProjectForm projectId={id} />;
}
