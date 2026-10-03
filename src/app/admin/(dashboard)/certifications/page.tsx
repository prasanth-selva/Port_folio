import { CrudTable } from "@/components/admin/AdminUI";
import { deleteCertification, reorderCertifications, saveCertification } from "@/lib/admin-actions";
import { getCertifications } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  const rows = await getCertifications();
  return (
    <CrudTable
      title="Certifications"
      rows={rows}
      primaryKey="title"
      saveAction={saveCertification}
      deleteAction={deleteCertification}
      reorderAction={reorderCertifications}
      fields={[
        { name: "title", label: "Title", full: true },
        { name: "issuer", label: "Issuer" },
        { name: "issued_on", label: "Issued (e.g. 2025)" },
        { name: "credential_url", label: "Credential URL", full: true },
        { name: "image", label: "Certificate or badge image", type: "image", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
