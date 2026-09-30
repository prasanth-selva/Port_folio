import { MdxEditor } from "@/components/admin/MdxEditor";
import { savePost } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default function NewWriteupPage() {
  return <MdxEditor saveAction={savePost} />;
}
