import { CrudTable } from "@/components/admin/AdminUI";
import { deleteSkill, reorderTable, saveSkill } from "@/lib/admin-actions";
import { getSkills } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const rows = await getSkills();
  return (
    <CrudTable
      title="Skills"
      rows={rows}
      primaryKey="name"
      saveAction={saveSkill}
      deleteAction={deleteSkill}
      reorderAction={(ids) => reorderTable("skills", ids)}
      fields={[
        { name: "name", label: "Name" },
        { name: "category", label: "Category (Core/Defense/Offense/Build)" },
        { name: "level", label: "Level (1–100)", type: "number" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published" },
      ]}
    />
  );
}
