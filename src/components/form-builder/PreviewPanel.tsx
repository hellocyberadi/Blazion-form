import { useState } from "react";
import { Laptop, Tablet, Smartphone, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PublicFormClient } from "@/app/f/[slug]/client";
import type { Form, Question } from "@/types";

interface PreviewPanelProps {
  form: Form;
  questions: Question[];
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function PreviewPanel({ form, questions }: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  
  // Add a key to force re-render when switching devices or data changes so we reset the form state
  const resetKey = `${device}-${form.id}-${questions.length}`;

  const renderContent = () => {
    return (
      <div 
        className={cn(
          "w-full h-full bg-white overflow-y-auto overflow-x-hidden relative",
          device === 'mobile' ? "rounded-3xl pointer-events-none" : "rounded-lg" // pointer events none on border wrapper, re-enabled inside
        )}
      >
        <div className="pointer-events-auto min-h-full">
          <PublicFormClient key={resetKey} form={form} questions={questions} isPreview={true} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#e5e2da] h-full overflow-hidden">
      {/* Top Bar inside preview */}
      <div className="flex-shrink-0 h-14 border-b border-[rgba(191,200,199,0.3)] px-6 flex items-center justify-between bg-[#fcf9f1]">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[rgba(191,200,199,0.5)] shadow-sm">
          <button 
            onClick={() => setDevice('desktop')}
            className={cn("p-1.5 rounded-lg transition-colors", device === 'desktop' ? "bg-black/5 text-[#1c1c17]" : "text-[#707978] hover:text-[#1c1c17]")}
            title="Desktop"
          >
            <Laptop className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDevice('tablet')}
            className={cn("p-1.5 rounded-lg transition-colors", device === 'tablet' ? "bg-black/5 text-[#1c1c17]" : "text-[#707978] hover:text-[#1c1c17]")}
            title="Tablet"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDevice('mobile')}
            className={cn("p-1.5 rounded-lg transition-colors", device === 'mobile' ? "bg-black/5 text-[#1c1c17]" : "text-[#707978] hover:text-[#1c1c17]")}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {form.slug && (
          <Link 
            href={`/f/${form.slug}`} target="_blank" 
            className="flex items-center gap-2 text-xs font-semibold text-[#002e2c] border border-[#002e2c] px-3 py-1.5 rounded-lg hover:bg-[#002e2c] hover:text-white transition-colors"
          >
            <ExternalLink className="h-3 w-3" /> Live Form
          </Link>
        )}
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex items-start justify-center p-6 md:p-12">
        {device === 'desktop' && (
          <div className="w-full max-w-5xl bg-white shadow-xl min-h-full rounded-b-xl overflow-hidden transition-all duration-300 transform outline outline-1 outline-black/5">
            {/* Fake browser chrome */}
            <div className="h-8 bg-[#f0f0f0] flex items-center px-4 gap-1.5 border-b border-black/5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            </div>
            {renderContent()}
          </div>
        )}

        {device === 'tablet' && (
          <div className="w-full max-w-2xl bg-white shadow-2xl min-h-[900px] h-[900px] rounded-[2rem] overflow-hidden transition-all duration-300 transform border-[16px] border-[#1a1a1a] relative">
            {renderContent()}
          </div>
        )}

        {device === 'mobile' && (
          <div className="w-[375px] h-[812px] bg-white shadow-2xl rounded-[3rem] overflow-hidden transition-all duration-300 transform border-[14px] border-[#1a1a1a] relative flex-shrink-0">
            {/* Dynamic Island fake */}
            <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
              <div className="w-32 h-7 bg-[#1a1a1a] rounded-b-3xl"></div>
            </div>
            <div className="pt-7 h-full">
              {renderContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
