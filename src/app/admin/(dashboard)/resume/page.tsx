import { ResumeUploader } from "@/components/admin/ResumeUploader";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminResumePage() {
  const settings = await getSettings();
  return <ResumeUploader currentUrl={settings.resumeUrl} />;
}
