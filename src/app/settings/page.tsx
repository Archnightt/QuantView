import { ThemeCustomizer } from "@/components/ThemeCustomizer";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-[3px] h-5 rounded-full bg-brand" />
          <h1 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Appearance
          </h1>
        </div>
        <p className="font-display text-3xl text-foreground mt-2">Color Mode</p>
        <p className="text-sm font-sans text-muted-foreground mt-1">
          Choose between light and dark mode, or let your system decide.
        </p>
      </div>

      <ThemeCustomizer />
    </div>
  );
}
