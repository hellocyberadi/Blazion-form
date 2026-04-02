"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Share2, QrCode, Code2, Download } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import type { Form } from "@/types";

interface Props { form: Form }

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f6f3eb] hover:bg-[#002e2c] hover:text-white text-[#1c1c17] text-xs font-medium transition-all">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function SharePageClient({ form }: Props) {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/f/${form.slug}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" style="border-radius:12px;"></iframe>`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Fill out this form: ${shareUrl}`)}`;

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg") as unknown as SVGElement;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href={`/forms/${form.id}/edit`} className="flex items-center gap-2 text-sm text-[#707978] hover:text-[#002e2c] mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to editor
        </Link>
        <h1 className="font-heading font-black text-3xl text-[#1c1c17]">Share Form</h1>
        <p className="text-[#404847] mt-1">{form.is_published ? "Your form is live and accepting responses." : "Publish your form first to make it accessible."}</p>
      </div>

      {/* Status */}
      {!form.is_published && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-yellow-600 font-semibold text-sm">⚠️ Form is not published yet. Go to the editor to publish it.</span>
        </div>
      )}

      {/* Share Link */}
      <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="h-5 w-5 text-[#002e2c]" />
          <h2 className="font-heading font-semibold text-lg text-[#1c1c17]">Share Link</h2>
        </div>
        <div className="flex items-center gap-3 bg-[#f6f3eb] rounded-xl px-4 py-3">
          <span className="flex-1 text-sm text-[#404847] font-mono truncate">{shareUrl}</span>
          <CopyButton value={shareUrl} label="Link" />
        </div>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1ebd58] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          Share on WhatsApp
        </a>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-[#002e2c]" />
          <h2 className="font-heading font-semibold text-lg text-[#1c1c17]">QR Code</h2>
        </div>
        <div className="flex items-center gap-8">
          <div className="bg-white p-4 rounded-2xl border border-[rgba(191,200,199,0.3)] inline-block">
            <QRCodeSVG id="qr-code-svg" value={shareUrl} size={160} fgColor="#002e2c" />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-[#404847]">Download this QR code and use it on print materials, posters, or business cards.</p>
            <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm font-medium text-[#1c1c17] hover:bg-[#002e2c] hover:text-white transition-all">
              <Download className="h-4 w-4" /> Download SVG
            </button>
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-6">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="h-5 w-5 text-[#002e2c]" />
          <h2 className="font-heading font-semibold text-lg text-[#1c1c17]">Embed on Website</h2>
        </div>
        <div className="bg-[#1c1c17] rounded-xl p-4 mb-3 relative">
          <code className="text-xs text-[#98d1cc] font-mono break-all">{embedCode}</code>
        </div>
        <CopyButton value={embedCode} label="Embed code" />
      </div>
    </div>
  );
}
