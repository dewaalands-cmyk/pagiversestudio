import { notFound } from "next/navigation";
import PagiverseStudioEditor from "@/components/templates/PagiverseStudioEditor";
import { getTemplateById, TEMPLATE_LIBRARY } from "@/lib/template-library";

export function generateStaticParams() {
  return TEMPLATE_LIBRARY.map((template) => ({ templateId: template.id }));
}

export function generateMetadata({ params }) {
  const template = getTemplateById(params.templateId);
  return { title: template ? `Edit ${template.name} | Pagiverse Studio` : "Pagiverse Studio" };
}

export default function StudioTemplatePage({ params }) {
  const template = getTemplateById(params.templateId);
  if (!template) notFound();
  return <PagiverseStudioEditor template={template} />;
}
