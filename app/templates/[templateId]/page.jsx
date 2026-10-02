import { notFound } from "next/navigation";
import TemplatePreviewClient from "@/components/templates/TemplatePreviewClient";
import { getTemplateById, getTemplateDescription, TEMPLATE_LIBRARY } from "@/lib/template-library";

export function generateStaticParams() {
  return TEMPLATE_LIBRARY.map((template) => ({ templateId: template.id }));
}

export function generateMetadata({ params }) {
  const template = getTemplateById(params.templateId);
  if (!template) return {};
  return {
    title: `${template.name} | Template Pagiverse Studio`,
    description: getTemplateDescription(template, "id"),
  };
}

export default function TemplatePreviewPage({ params }) {
  const template = getTemplateById(params.templateId);
  if (!template) notFound();
  return <TemplatePreviewClient template={template} />;
}
