import { PromptBuilder } from "@/components/prompts/prompt-builder";

export default function PromptsPage() {
  return (
    <div className="p-7">
      <h2 className="text-lg font-bold text-brand-900 mb-5">Prompt Builder</h2>
      <PromptBuilder />
    </div>
  );
}
