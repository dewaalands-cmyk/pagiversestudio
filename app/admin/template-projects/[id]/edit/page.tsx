"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ManifestStudioEditor from "@/components/templates/ManifestStudioEditor";
import { getTemplateById } from "@/lib/template-library";
import type { TemplateProject } from "@/types";

export default function EditTemplateProjectPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<TemplateProject | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/template-projects/${params.id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Project tidak dapat dimuat.");
        setProject(data);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Project tidak dapat dimuat."));
  }, [params.id]);

  if (error) return <main className="grid min-h-[70vh] place-items-center p-6 text-sm text-red-700">{error}</main>;
  if (!project) return <main className="grid min-h-[70vh] place-items-center p-6 text-sm text-slate-muted">Memuat editor...</main>;
  const template = getTemplateById(project.template_id);
  if (!template) return <main className="grid min-h-[70vh] place-items-center p-6 text-sm text-red-700">Template sumber tidak tersedia.</main>;
  return <ManifestStudioEditor template={template} mode="admin" adminProjectId={project.id} initialConfiguration={project.configuration} />;
}
