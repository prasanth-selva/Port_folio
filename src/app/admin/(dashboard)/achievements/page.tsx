import { CrudTable } from "@/components/admin/AdminUI";
import { deleteAchievement, reorderAchievements, saveAchievement } from "@/lib/admin-actions";
import { getAchievements } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminAchievementsPage() {
  const rows = await getAchievements();
  return (
    <CrudTable
      title="Achievements"
      rows={rows}
      primaryKey="title"
      saveAction={saveAchievement}
      deleteAction={deleteAchievement}
      reorderAction={reorderAchievements}
      fields={[
        { name: "title", label: "Title", full: true },
        { name: "detail", label: "Detail", type: "textarea", full: true },
        { name: "occurred_on", label: "When (e.g. Mar 2026)" },
        { name: "image", label: "Image URL", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published" },
      ]}
    />
  );
}
