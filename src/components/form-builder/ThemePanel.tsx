import { THEME_PRESETS } from "@/lib/constants";
import { FormTheme } from "@/types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemePanelProps {
  theme: FormTheme;
  onUpdate: (theme: Partial<FormTheme>) => void;
}

export function ThemePanel({ theme, onUpdate }: ThemePanelProps) {
  const fonts = ["Inter", "Roboto", "Outfit", "Open Sans", "Lora", "Merriweather", "Playfair Display", "Monospace"];
  const borderRadiuses = [
    { label: "Sharp", value: "0px" },
    { label: "Slight", value: "4px" },
    { label: "Rounded", value: "8px" },
    { label: "Max", value: "9999px" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <h2 className="font-heading font-bold text-2xl text-[#1c1c17]">Form Design</h2>

      <div className="bg-white rounded-2xl p-6 border border-[rgba(191,200,199,0.3)] shadow-sm space-y-5">
        <h3 className="font-bold text-lg text-[#1c1c17] mb-2">Theme Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isSelected = preset.primaryColor === theme.primaryColor && preset.backgroundColor === theme.backgroundColor;
            return (
              <button
                key={preset.name}
                onClick={() => onUpdate({
                  primaryColor: preset.primaryColor,
                  backgroundColor: preset.backgroundColor,
                  textColor: preset.textColor,
                  buttonColor: preset.buttonColor,
                })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:-translate-y-1",
                  isSelected ? "border-[#002e2c] bg-[#f6f3eb]" : "border-[rgba(191,200,199,0.3)] hover:border-[rgba(191,200,199,0.6)]"
                )}
              >
                <div 
                  className="w-10 h-10 rounded-full relative shadow-sm border border-black/10"
                  style={{ background: `linear-gradient(135deg, ${preset.backgroundColor} 0%, ${preset.primaryColor} 100%)` }}
                >
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#002e2c] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-[#404847]">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[rgba(191,200,199,0.3)] shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-[#1c1c17]">Custom Colors</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#1c1c17] mb-2">Background Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={theme.backgroundColor}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1c17] mb-2">Primary Action Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={theme.primaryColor}
                onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1c17] mb-2">Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={theme.textColor}
                onChange={(e) => onUpdate({ textColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1c17] mb-2">Button Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.buttonColor}
                onChange={(e) => onUpdate({ buttonColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={theme.buttonColor}
                onChange={(e) => onUpdate({ buttonColor: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm outline-none uppercase font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[rgba(191,200,199,0.3)] shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-[#1c1c17]">Typography & Style</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1c1c17] mb-2">Font Family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => onUpdate({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm outline-none focus:ring-2 focus:ring-[#002e2c]"
              style={{ fontFamily: theme.fontFamily }}
            >
              {fonts.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1c1c17] mb-2">Border Radius</label>
            <div className="flex gap-2">
              {borderRadiuses.map((br) => (
                <button
                  key={br.value}
                  onClick={() => onUpdate({ borderRadius: br.value })}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium border-2 transition-colors",
                    theme.borderRadius === br.value ? "border-[#002e2c] bg-[#f6f3eb] text-[#002e2c]" : "border-[rgba(191,200,199,0.3)] text-[#707978] hover:bg-black/5"
                  )}
                  style={{ borderRadius: br.value }}
                >
                  {br.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
