import { ThemeCustomizer } from "@/components/ThemeCustomizer";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Appearance</h2>
        <p className="text-muted-foreground">
          Customize the look and feel of your dashboard.
        </p>
      </div>
      
      <ThemeCustomizer />
    </div>
  );
}
