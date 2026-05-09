import { useState, useEffect } from "react";

const NAMES = [
  "Kevin O.",
  "Mary W.",
  "Brian K.",
  "Alice N.",
  "Mercy J.",
  "David L.",
  "Suleiman M.",
];
const AMOUNTS = ["KES 10,000", "KES 15,000", "KES 30,000", "KES 5,000"];

export function LiveTicker() {
  const [activities, setActivities] = useState([
    { name: "John M.", phone: "0712***456", amount: "KES 15,000" },
    { name: "Sarah W.", phone: "0722***789", amount: "KES 30,000" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEntry = {
        name: NAMES[Math.floor(Math.random() * NAMES.length)],
        phone: `07${Math.floor(10 + Math.random() * 90)}***${Math.floor(100 + Math.random() * 900)}`,
        amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
      };
      // Keep only the last 10 entries
      setActivities((prev) => [newEntry, ...prev.slice(0, 9)]);
    }, 4000); // New disbursement every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-brand-light py-3 border-y border-brand/10 overflow-hidden relative">
      <div className="flex items-center">
        {/* Label - Fixed on the left for mobile visibility */}
        <div className="bg-brand-light z-10 px-4 flex items-center gap-2 shrink-0">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-bold text-brand text-xs md:text-sm whitespace-nowrap">
            LIVE DISBURSEMENTS
          </span>
        </div>

        {/* The Marquee */}
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap gap-12">
          {activities.map((act, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs md:text-sm"
            >
              <span className="font-bold text-dark">{act.name}</span>
              <span className="text-gray-400">{act.phone}</span>
              <span className="text-brand font-black">
                Received {act.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
