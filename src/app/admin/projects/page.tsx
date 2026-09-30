import { CrudTable } from "@/components/admin/AdminUI";
import { deleteProject, reorderTable, saveProject } from "@/lib/admin-actions";
import { getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getProjects();
  return (
    <CrudTable
      title="Projects"
      rows={projects}
      primaryKey="title"
      saveAction={saveProject}
      deleteAction={deleteProject}
      reorderAction={(ids) => reorderTable("projects", ids)}
      fields={[
        { name: "title", label: "Title" },
        { name: "slug", label: "Slug (url)" },
        { name: "tagline", label: "Tagline", full: true },
        { name: "description", label: "Description", type: "textarea", full: true },
        { name: "tech", label: "Tech (comma-separated)", full: true },
        { name: "cover_image", label: "Cover image URL", full: true },
        { name: "gallery", label: "Gallery URLs (comma-separated)", full: true },
        { name: "live_url", label: "Live URL" },
        { name: "github_url", label: "GitHub URL" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "featured", label: "Featured" },
        { name: "published", label: "Published" },
      ]}
    />
  );
}
