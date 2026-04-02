"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Sparkles, Wand2, ShieldCheck, Zap, Globe,
  FileText, BarChart3, Users, CheckCircle, ChevronRight,
  Star, Fingerprint, CreditCard, Phone, MapPin, MessageSquare,
  Layout, Settings, Eye, Share2,
  Play, Brain, MessageCircle, ExternalLink
} from "lucide-react";

// —————————————————————————————————————— 
// Animation Variants
// ——————————————————————————————————————
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } }
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } }
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ——————————————————————————————————————
// Floating Nav
// ——————————————————————————————————————
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-ambient border-b border-[rgba(191,200,199,0.2)] py-3"
          : "bg-transparent py-6"
      } px-6 md:px-12`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-signature-gradient rounded-xl flex items-center justify-center shadow-ambient transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5 text-[#fcf9f1]" />
          </div>
          <span className="text-xl font-heading font-black tracking-tighter text-[#002e2c]">
            Blazion Forms
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Templates", "Pricing", "Docs"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-[#404847] hover:text-[#002e2c] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link href="/builder/new" className="hidden md:block text-sm font-semibold text-[#002e2c] hover:text-[#004643] transition-colors">
            Sign In
          </Link>
          <Link href="/builder/new">
            <button className="bg-signature-gradient text-[#fcf9f1] px-5 py-2.5 rounded-lg font-semibold text-sm shadow-ambient transition-all hover:-translate-y-0.5 hover:shadow-ambient-lg flex items-center gap-2">
              Start Building <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ——————————————————————————————————————
// Hero Section
// ——————————————————————————————————————
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-24 pb-20 px-6 noise-texture bg-[#fcf9f1]">
      {/* Soft glow blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#f9bc60] opacity-10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#98d1cc] opacity-15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* AI Breadcrumb chip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 ai-chip px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-10"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#f9bc60]" />
          Powered by Gemini AI · Built for Bharat
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className="font-heading font-black text-[clamp(3rem,8vw,5.5rem)] leading-[0.9] tracking-tighter text-[#1c1c17] mb-8"
        >
          Forms that feel like
          <br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #002e2c 0%, #2e6764 50%, #004643 100%)" }}
          >
            architecture.
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="text-[#404847] text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12"
        >
          The only form builder engineered for Indian data structures — Aadhaar, PAN, UPI, and multi-language. Describe what you need. Our AI builds the rest.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/builder/new">
            <button className="bg-signature-gradient text-[#fcf9f1] px-8 py-4 rounded-xl font-bold text-base shadow-ambient-lg transition-all hover:-translate-y-1 flex items-center gap-3 group">
              Design your Intelligence
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <button className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-[#002e2c] text-base hover:bg-[#f1eee6] transition-all ghost-border">
            <Play className="h-4 w-4" />
            Watch Demo
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#404847]"
        >
          <div className="flex -space-x-2">
            {["bg-[#004643]", "bg-[#f9bc60]", "bg-[#98d1cc]", "bg-[#2e6764]", "bg-[#e5e2da]"].map((color, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${color} flex items-center justify-center text-xs font-bold text-white`}>
                {["A","B","C","D","E"][i]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#f9bc60] text-[#f9bc60]" />
            ))}
            <span className="ml-2 font-semibold">4.9/5</span>
            <span className="text-[#707978] ml-1">from 2,000+ teams across India</span>
          </div>
        </motion.div>
      </div>

      {/* Hero visual — floating form preview */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-20 w-full max-w-4xl mx-auto"
      >
        <div className="relative bg-white rounded-3xl shadow-ambient-lg overflow-hidden ghost-border">
          {/* Form preview mockup */}
          <div className="bg-[#f6f3eb] px-6 py-4 flex items-center gap-3 border-b border-[rgba(191,200,199,0.2)]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#e5e2da]" />
              <div className="w-3 h-3 rounded-full bg-[#e5e2da]" />
              <div className="w-3 h-3 rounded-full bg-[#e5e2da]" />
            </div>
            <div className="flex-1 bg-[#ebe8e0] rounded-full h-6 max-w-72 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(191,200,199,0.15)]">
            {/* Left panel */}
            <div className="p-5 bg-[#f6f3eb] space-y-2">
              <div className="text-xs font-semibold tracking-widest uppercase text-[#707978] mb-4">Question Palette</div>
              {["Short Text","Multiple Choice","Aadhaar Card","PAN Number","Indian Phone"].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${i === 2 ? "bg-[#002e2c] text-white" : "bg-white text-[#1c1c17] hover:bg-[#ebe8e0]"}`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${i === 2 ? "bg-white/20" : "bg-[#f1eee6]"}`}>
                    {[<FileText className="h-3 w-3" />, <CheckCircle className="h-3 w-3" />, <Fingerprint className="h-3 w-3" />, <CreditCard className="h-3 w-3" />, <Phone className="h-3 w-3" />][i]}
                  </div>
                  <span className="text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>
            {/* Center canvas */}
            <div className="p-6 col-span-1 space-y-4 bg-[#fcf9f1]">
              <h3 className="font-heading font-bold text-[#1c1c17] text-sm">Job Application Form</h3>
              {["Full Name", "Work Email", "Aadhaar Number"].map((label, i) => (
                <div key={i} className={`space-y-1.5 ${i === 2 ? "ring-2 ring-[#002e2c] rounded-lg p-3 bg-white" : ""}`}>
                  <label className="text-xs font-medium text-[#404847]">{label} {i === 2 && <span className="text-[#f9bc60] ml-1 text-xs font-semibold">Indian Special</span>}</label>
                  <div className={`h-9 rounded-lg ${i === 2 ? "bg-[#f6f3eb] border border-[#98d1cc]/40" : "bg-[#ebe8e0]"} flex items-center px-3`}>
                    {i === 2 && <span className="text-xs text-[#707978] font-mono">XXXX-XXXX-XXXX</span>}
                  </div>
                </div>
              ))}
              <button className="w-full bg-signature-gradient text-white text-xs font-semibold py-3 rounded-lg shadow-ambient">
                Submit Application
              </button>
            </div>
            {/* Right panel */}
            <div className="p-5 bg-[#f6f3eb] space-y-3">
              <div className="text-xs font-semibold tracking-widest uppercase text-[#707978] mb-4">AI Properties</div>
              <div className="ai-chip rounded-xl p-3 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold mb-1"><Sparkles className="h-3 w-3 text-[#f9bc60]" /> AI Suggestion</div>
                Add a file upload field for resume/CV — common in job applications.
              </div>
              <div className="space-y-2">
                {["Required", "Aadhaar Validation", "Auto-mask Input"].map((opt) => (
                  <div key={opt} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 ghost-border">
                    <span className="text-xs text-[#404847]">{opt}</span>
                    <div className="w-8 h-4 bg-[#002e2c] rounded-full flex items-center justify-end pr-0.5"><div className="w-3 h-3 bg-white rounded-full" /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Floating badge */}
        <div className="absolute -top-4 -right-4 ai-chip px-4 py-2 rounded-full text-xs font-bold shadow-ambient hidden md:flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[#f9bc60]" />
          AI Generated in 3s
        </div>
      </motion.div>
    </section>
  );
}

// ——————————————————————————————————————
// Logos Marquee
// ——————————————————————————————————————
function LogosStrip() {
  const logos = ["Razorpay", "Zepto", "CRED", "PhonePe", "Groww", "Zomato", "Meesho", "BYJU's"];
  return (
    <section className="py-12 bg-[#f6f3eb] overflow-hidden">
      <p className="text-center text-xs font-semibold tracking-widest uppercase text-[#707978] mb-8">Trusted by teams at India's fastest-growing companies</p>
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {[...logos, ...logos].map((logo, i) => (
          <span key={i} className="text-xl font-heading font-black text-[#bfc8c7] hover:text-[#002e2c] transition-colors cursor-default">
            {logo}
          </span>
        ))}
      </div>
      <style>{`.animate-marquee { animation: marquee 25s linear infinite; } @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

// ——————————————————————————————————————
// Features
// ——————————————————————————————————————
const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    label: "AI Generation",
    title: "Describe it. We build it.",
    description: "Tell our Gemini-powered AI what form you need in plain English or Hindi. It generates the complete structure, field types, and logic in seconds.",
    accent: "bg-[#f9bc60]/15",
    iconBg: "bg-[#f9bc60]/20 text-[#624000]",
  },
  {
    icon: <Fingerprint className="h-6 w-6" />,
    label: "Indian Specials",
    title: "Built for Bharat.",
    description: "Native field types for Aadhaar (masked + validated), PAN, UPI IDs, Indian Pincodes, State selectors, and OTP verification via SMS.",
    accent: "bg-[#98d1cc]/15",
    iconBg: "bg-[#98d1cc]/20 text-[#002e2c]",
  },
  {
    icon: <Layout className="h-6 w-6" />,
    label: "Drag & Drop",
    title: "Architect your canvas.",
    description: "A three-column editorial workspace gives you the palette, canvas, and logic panel — no cramped toolbars or hidden menus.",
    accent: "bg-[#e5e2da]/60",
    iconBg: "bg-[#e5e2da] text-[#404847]",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    label: "Conversational Mode",
    title: "Turn any form into a chat.",
    description: "Activate conversational mode to transform static forms into guided, one-question-at-a-time chat interfaces. Higher completion rates, guaranteed.",
    accent: "bg-[#f9bc60]/15",
    iconBg: "bg-[#f9bc60]/20 text-[#624000]",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    label: "Smart Analytics",
    title: "Intelligence in every response.",
    description: "AI-powered response summaries, drop-off analysis, and cross-tab reporting. Understand your data without opening a spreadsheet.",
    accent: "bg-[#98d1cc]/15",
    iconBg: "bg-[#98d1cc]/20 text-[#002e2c]",
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    label: "Share Everywhere",
    title: "Meet respondents where they are.",
    description: "Share via WhatsApp, embed on your site, send by email, or generate a QR code. Built-in WhatsApp notifications for new responses.",
    accent: "bg-[#e5e2da]/60",
    iconBg: "bg-[#e5e2da] text-[#404847]",
  },
];

function Features() {
  return (
    <section className="py-32 px-6 bg-[#fcf9f1]">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="text-center mb-20">
          <motion.div variants={fadeUp} className="ai-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            <Settings className="h-3.5 w-3.5 text-[#f9bc60]" /> Core Capabilities
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-heading font-black text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-tighter text-[#1c1c17] mb-5">
            Every feature built with<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #002e2c 0%, #2e6764 100%)" }}>one purpose.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#404847] text-lg max-w-xl mx-auto">
            Most form builders give you widgets. Blazion gives you an intelligence layer.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`group p-8 rounded-2xl ${f.accent} hover:shadow-ambient-lg transition-all duration-500 hover:-translate-y-1 cursor-default`}
            >
              <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                {f.icon}
              </div>
              <div className="text-xs font-semibold tracking-widest uppercase text-[#707978] mb-2">{f.label}</div>
              <h3 className="text-xl font-heading font-bold text-[#1c1c17] mb-3">{f.title}</h3>
              <p className="text-[#404847] text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ——————————————————————————————————————
// How It Works
// ——————————————————————————————————————
const steps = [
  { number: "01", title: "Describe your form", body: "Type your idea in plain English or Hindi. \"Create a Diwali party registration form with food preference and RSVP count.\"" },
  { number: "02", title: "AI builds the structure", body: "Gemini AI generates the question types, labels, validation logic, and Indian-specific fields — in seconds." },
  { number: "03", title: "Customize & publish", body: "Use the editorial three-column builder to fine-tune every detail, then share via link, WhatsApp, embed, or QR code." },
];

function HowItWorks() {
  return (
    <section className="py-32 bg-[#f6f3eb] px-6">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <motion.div variants={fadeUp} className="ai-chip inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
              <Play className="h-3.5 w-3.5 text-[#f9bc60]" /> How It Works
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-heading font-black text-[clamp(2rem,4vw,3rem)] leading-tight tracking-tighter text-[#1c1c17] mb-12">
              Three steps from idea<br />to live form.
            </motion.h2>
            <div className="space-y-10">
              {steps.map((step, i) => (
                <motion.div key={i} variants={fadeUp} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-signature-gradient flex items-center justify-center shadow-ambient">
                      <span className="text-xs font-black text-white">{step.number}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#1c1c17] mb-2">{step.title}</h3>
                    <p className="text-[#404847] text-sm leading-relaxed">{step.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual Mockup */}
          <motion.div variants={fadeUp} className="relative">
            <div className="bg-white rounded-2xl shadow-ambient-lg overflow-hidden ghost-border">
              <div className="bg-[#002e2c] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="h-4 w-4 text-[#f9bc60]" />
                  <span className="text-[#fcf9f1] text-xs font-semibold">Intelligence Generator</span>
                </div>
                <div className="bg-[rgba(252,249,241,0.1)] rounded-xl p-4 text-[#f6f3eb] text-sm font-medium italic leading-relaxed">
                  "Create a job application form for a senior developer role at my startup — include Aadhaar, work experience, GitHub profile, and expected CTC."
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Full Name", type: "Short Text", ready: true },
                  { label: "Aadhaar Number", type: "Indian Special ✦", ready: true },
                  { label: "GitHub Profile URL", type: "URL Field", ready: true },
                  { label: "Expected CTC (LPA)", type: "Number", ready: false },
                ].map((field, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${field.ready ? "bg-[#f6f3eb]" : "bg-[#ebe8e0] opacity-50"}`}>
                    <div>
                      <div className="text-xs font-semibold text-[#1c1c17]">{field.label}</div>
                      <div className="text-[10px] text-[#707978] mt-0.5">{field.type}</div>
                    </div>
                    {field.ready ? (
                      <CheckCircle className="h-4 w-4 text-[#004643]" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-[#bfc8c7] border-t-[#002e2c] animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-ambient-lg p-4 ghost-border flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f9bc60]/20 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-[#624000]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1c1c17]">Generated in 2.3s</div>
                <div className="text-[10px] text-[#707978]">4 fields · Aadhaar validated</div>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ——————————————————————————————————————
// Indian Specials Showcase
// ——————————————————————————————————————
const indianFields = [
  { icon: <Fingerprint className="h-5 w-5" />, name: "Aadhaar Card", desc: "12-digit masked validation" },
  { icon: <CreditCard className="h-5 w-5" />, name: "PAN Number", desc: "Regex + format enforcement" },
  { icon: <Phone className="h-5 w-5" />, name: "Indian Phone", desc: "+91 auto-prefix, 10-digit verify" },
  { icon: <MapPin className="h-5 w-5" />, name: "Pincode Lookup", desc: "State/city auto-fill" },
  { icon: <Globe className="h-5 w-5" />, name: "UPI Payment", desc: "Razorpay integrated" },
  { icon: <MessageSquare className="h-5 w-5" />, name: "OTP Verify", desc: "SMS via Twilio / MSG91" },
  { icon: <Users className="h-5 w-5" />, name: "Language Toggle", desc: "Hindi, Tamil, Telugu, Bengali" },
  { icon: <ShieldCheck className="h-5 w-5" />, name: "e-Sign Field", desc: "Aadhaar e-Sign ready" },
];

function IndianSpecials() {
  return (
    <section className="py-32 px-6 bg-[#002e2c] noise-texture overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#f9bc60] opacity-5 blur-[120px] rounded-full" />
      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedSection className="mb-16 text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[rgba(249,188,96,0.15)] border border-[rgba(249,188,96,0.3)] text-[#f9bc60] px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
            🇮🇳 Indian Intelligence
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-heading font-black text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-tighter text-[#fcf9f1] mb-5">
            Made for the Indian<br />data landscape.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#98d1cc] text-lg max-w-xl mx-auto">
            Stop hacking generic field types. These are built from the ground up for Indian regulations and formats.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {indianFields.map((field, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group p-5 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300 cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgba(249,188,96,0.15)] flex items-center justify-center text-[#f9bc60] mb-4 group-hover:scale-110 transition-transform">
                {field.icon}
              </div>
              <div className="text-sm font-bold text-[#fcf9f1] mb-1">{field.name}</div>
              <div className="text-xs text-[#98d1cc] leading-relaxed">{field.desc}</div>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ——————————————————————————————————————
// Testimonials
// ——————————————————————————————————————
const testimonials = [
  {
    name: "Priya Sharma",
    role: "HR Lead, Razorpay",
    quote: "The Aadhaar field alone saved our team 3 hours of manual verification per week. The AI generator is genuinely magic.",
    rating: 5,
    avatar: "P",
    avatarBg: "bg-[#004643]",
  },
  {
    name: "Karan Mehta",
    role: "Co-founder, GreenTech",
    quote: "We built a 24-field government compliance form in literally 8 minutes. No developer needed. The WhatsApp share flow is incredible.",
    rating: 5,
    avatar: "K",
    avatarBg: "bg-[#f9bc60]",
  },
  {
    name: "Ananya Reddy",
    role: "Ops Manager, Zepto",
    quote: "Finally a form builder that doesn't make me feel like I'm in 2013. The editorial design speaks to our brand perfectly.",
    rating: 5,
    avatar: "A",
    avatarBg: "bg-[#98d1cc]",
  },
];

function Testimonials() {
  return (
    <section className="py-32 px-6 bg-[#f6f3eb]">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="mb-16 text-center">
          <motion.h2 variants={fadeUp} className="font-heading font-black text-[clamp(2rem,5vw,3.5rem)] leading-tight tracking-tighter text-[#1c1c17] mb-4">
            Built with teams, for teams.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#404847] text-lg">Real stories from across India.</motion.p>
        </AnimatedSection>
        <AnimatedSection className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-[#fcf9f1] rounded-2xl p-8 shadow-ambient hover:shadow-ambient-lg transition-all duration-500 hover:-translate-y-1">
              <div className="flex gap-1 mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-[#f9bc60] text-[#f9bc60]" />
                ))}
              </div>
              <p className="text-[#1c1c17] font-medium leading-relaxed mb-8 text-sm">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center font-bold text-white text-sm`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#1c1c17] text-sm">{t.name}</div>
                  <div className="text-[#707978] text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}

// ——————————————————————————————————————
// CTA Banner
// ——————————————————————————————————————
function CTABanner() {
  return (
    <section className="py-32 px-6 bg-[#fcf9f1]">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="bg-signature-gradient rounded-3xl p-16 text-center relative overflow-hidden shadow-ambient-lg">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #f9bc60 0%, transparent 60%)" }} />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[rgba(249,188,96,0.2)] border border-[rgba(249,188,96,0.3)] text-[#f9bc60] px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase mb-8">
                <Sparkles className="h-3.5 w-3.5" /> Start Free Today
              </div>
              <h2 className="font-heading font-black text-[clamp(2rem,5vw,3.5rem)] text-[#fcf9f1] leading-tight tracking-tighter mb-6">
                Your first form in<br />under 60 seconds.
              </h2>
              <p className="text-[#98d1cc] text-lg mb-10 max-w-xl mx-auto">
                No credit card. No setup fee. Just describe what you need.
              </p>
              <Link href="/builder/new">
                <button className="bg-[#f9bc60] hover:bg-[#f0b050] text-[#002220] px-10 py-5 rounded-xl font-black text-base shadow-ambient-lg transition-all hover:-translate-y-1 flex items-center gap-3 mx-auto">
                  Design your Intelligence <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ——————————————————————————————————————
// Footer
// ——————————————————————————————————————
function Footer() {
  return (
    <footer className="bg-[#dddad2] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-signature-gradient rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-black text-[#1c1c17]">Blazion Forms</span>
            </div>
            <p className="text-[#404847] text-sm leading-relaxed">
              An AI-powered form builder engineered for the Indian data landscape.
            </p>
            <div className="flex gap-3 mt-6">
              {[Globe, MessageCircle, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-[#fcf9f1] flex items-center justify-center text-[#404847] hover:text-[#002e2c] hover:bg-white transition-all shadow-ambient">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { heading: "Product", links: ["Features", "Templates", "AI Generator", "Pricing", "Changelog"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
              { heading: "Legal", links: ["Privacy Policy", "Terms of Service", "DPDP Compliance", "Cookie Policy"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="font-semibold text-[#1c1c17] text-sm mb-4">{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[#404847] text-sm hover:text-[#002e2c] transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-[rgba(191,200,199,0.3)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#707978] text-xs">© 2026 Blazion Technologies Pvt. Ltd. · Made with ♥ in India</p>
          <p className="text-[#707978] text-xs">DPDP Act 2023 Compliant · ISO 27001 Ready</p>
        </div>
      </div>
    </footer>
  );
}

// ——————————————————————————————————————
// Main Export
// ——————————————————————————————————————
export default function Home() {
  return (
    <div className="text-[#1c1c17] font-sans selection:bg-[#002e2c] selection:text-[#fcf9f1]">
      <Nav />
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <IndianSpecials />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
