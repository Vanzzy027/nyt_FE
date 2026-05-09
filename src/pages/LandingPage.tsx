import React from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import ApplicationModal from "../components/ApplicationModal";
import { Briefcase, Users, Zap, GraduationCap } from "lucide-react";
import api from "../utils/api";
import { LiveTicker } from "../components/LiveTicket";

// Icon mapper to handle string-to-component conversion
const IconMap: Record<string, React.ReactNode> = {
  briefcase: <Briefcase className="w-8 h-8 text-brand" />,
  users: <Users className="w-8 h-8 text-brand" />,
  zap: <Zap className="w-8 h-8 text-brand" />,
  graduation: <GraduationCap className="w-8 h-8 text-brand" />,
};

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const openGeneralRegistration = () => {
    setSelectedProgram(null);
    setIsModalOpen(true);
  };

  const openProgramApplication = (prog: any) => {
    setSelectedProgram(prog);
    setIsModalOpen(true);
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get("/packages");
      setPrograms(res.data.data);
    } catch (error) {
      console.error("Could not load packages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brand" />
          <span className="text-xl font-bold tracking-tight">
            NYOTA <span className="text-brand">FUND</span>
          </span>
        </div>
        <div className="hidden md:flex gap-6 font-medium text-gray-600">
          <a href="#programs" className="hover:text-brand transition">
            Opportunities
          </a>
          <a href="#how-it-works" className="hover:text-brand transition">
            How it Works
          </a>
          <a href="#live" className="hover:text-brand transition">
            Live Activities
          </a>
        </div>

        <div className="flex gap-4">
          <button className="text-gray-700 font-medium hover:text-brand">
            Login
          </button>
          <button
            onClick={openGeneralRegistration}
            className="bg-brand text-white px-5 py-2 rounded-full font-medium hover:bg-brand-dark transition shadow-lg shadow-brand/30"
          >
            Register (KES 150)
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-20 pb-16 px-6 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-dark mb-6 leading-tight">
          Empowering the Youth <br />
          <span className="text-brand">Building the Future</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Get access to business loans, education grants, and skill-building
          funds. Apply directly for a specific tier, or join as a general member
          and let us find the perfect fit for you.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-brand text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-brand-dark transition shadow-xl shadow-brand/30 flex items-center justify-center gap-2">
            Browse Programs <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* LIVE ACTIVITIES TICKER */}
      <LiveTicker />

      {/* <section
        id="live"
        className="bg-brand-light py-4 border-y border-brand/20 overflow-hidden"
      >
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-8 px-4">
          <span className="font-bold text-brand mr-4">
            🔴 LIVE DISBURSEMENTS:
          </span>
          {recentWinners.map((winner, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{winner.name}</span>
              <span className="text-gray-500">({winner.phone})</span>
              <span className="text-brand font-bold pl-2 border-l border-gray-300">
                Received {winner.amount}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless infinite scroll effect */}
      {/* {recentWinners.map((winner, idx) => (
            <div key={`dup-${idx}`} className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{winner.name}</span>
              <span className="text-gray-500">({winner.phone})</span>
              <span className="text-brand font-bold pl-2 border-l border-gray-300">
                Received {winner.amount}
              </span>
            </div>
          ))}
        </div>
      </section> */}

      {/* PROGRAMS SECTION */}
      <section id="programs" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Available Interventions</h2>
          {loading && (
            <p className="mt-4 text-gray-400 animate-pulse">
              Scanning database for opportunities...
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
            >
              <div className="mb-4">
                {IconMap[prog.icon_name] || IconMap.briefcase}
              </div>

              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold leading-tight">
                  {prog.title}
                </h3>
                {prog.is_hot === 1 && (
                  <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Hot
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                {prog.description}
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Target</span>
                  <span className="font-bold text-dark">{prog.target}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Limit</span>
                  <span className="font-black text-brand">{prog.amount}</span>
                </div>
              </div>

              <button
                onClick={() => openProgramApplication(prog)}
                className="w-full bg-brand text-white py-3 rounded-xl font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] transition-transform"
              >
                Apply (KES {prog.service_fee})
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How to Get Started</h2>
          <p className="text-gray-600 mt-2">
            Follow these simple steps to access funds
          </p>
        </div>

        <div className="space-y-8">
          {[
            {
              step: 1,
              title: "Select a Category or Register",
              desc: "Browse our specific programs and click 'Apply', or click 'Register' at the top if you aren't sure where you fit. You will provide your ID, Education Level, and County.",
            },
            {
              step: 2,
              title: "Pay the Application Fee",
              desc: "Pay the required registration (KES 150) or the specific service fee (e.g., KES 199) securely via M-Pesa to process your application.",
            },
            {
              step: 3,
              title: "Increase Your Chances",
              desc: "Once logged in, share your referral link. Every successful referral increases your disbursement chances by 10%!",
            },
            {
              step: 4,
              title: "Receive Funds",
              desc: "Reach 100% chance and your funds will be disbursed automatically to your registered M-Pesa number.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start">
              <div className="shrink-0 w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                {item.step}
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* APPLICATION MODAL */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        program={selectedProgram}
      />
    </div>
  );
}
