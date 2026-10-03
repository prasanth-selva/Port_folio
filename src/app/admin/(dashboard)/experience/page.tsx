import { CrudTable } from "@/components/admin/AdminUI";
import { deleteExperience, reorderExperiences, saveExperience } from "@/lib/admin-actions";
import { getExperience } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const rows = await getExperience();
  return (
    <CrudTable
      title="Experience"
      rows={rows}
      primaryKey="role"
      saveAction={saveExperience}
      deleteAction={deleteExperience}
      reorderAction={reorderExperiences}
      fields={[
        { name: "role", label: "Role" },
        { name: "org", label: "Organization" },
        { name: "location", label: "Location" },
        { name: "start_date", label: "Start (e.g. Jun 2026)" },
        { name: "end_date", label: "End (blank if current)" },
        { name: "current", label: "Current position", type: "checkbox", defaultChecked: false },
        { name: "description", label: "Description", type: "textarea", full: true },
        { name: "tech", label: "Tech (comma-separated)", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
