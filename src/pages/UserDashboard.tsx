import { useState, useEffect } from "react";
import {
  User,
  Share2,
  TrendingUp,
  Wallet,
  CheckCircle,
  Copy,
  LogOut,
  ShieldCheck,
  Briefcase,
  History,
  Loader2,
  Lock, // Added Lock icon for the payment modal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePaystackPayment } from "react-paystack"; // Added Paystack hook
import api from "../utils/api";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<
    "overview" | "profile" | "loans"
  >("overview");
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- PAYSTACK CONFIGURATION ---
  const paystackConfig = {
    email: "payment@nyotafund.com", // Dummy email
    amount: 15000, // KES 150 in lowest denomination (cents)
    currency: "KES",
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaymentSuccess = async (transaction: any) => {
    console.log("Payment Successful! Reference:", transaction.reference);

    try {
      // 1. Send the reference to our new backend route
      const verifyRes = await api.post("/paystack/verify", {
        reference: transaction.reference,
      });

      if (verifyRes.data.success) {
        // 2. It worked! Re-fetch the user data.
        // This will pull the new 'ACTIVE' status and automatically make the Lock Screen vanish!
        const userRes = await api.get("/user/me");
        setUserData(userRes.data.data);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      alert(
        "Payment received, but verification failed. Please contact support.",
      );
    }
  };

  const handlePaymentClose = () => {
    console.log("User closed the payment modal.");
  };

  // --- FETCH USER DATA ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/user/me");
        setUserData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-brand gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="font-semibold text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!userData) return null;

  const firstName = userData.name.split(" ")[0];
  const totalChance = userData.disbursement_chance;
  const referralCount = userData.total_referrals || 0; // Fallback to 0 if undefined
  const referralLink = `${import.meta.env.VITE_FRONTEND_URL}?ref=${userData.referral_code}`;

  // Check if they are locked out!
  const isPendingPayment = userData.account_status === "PENDING_PAYMENT";

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* --- PAYMENT LOCK SCREEN OVERLAY --- */}
      {isPendingPayment && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-dark mb-2">
              Account Locked
            </h2>
            <p className="text-gray-500 mb-8">
              Hi {firstName}, you successfully created your account! However,
              you need to complete the <strong>KES 150</strong> registration fee
              to unlock your dashboard and access your starter loan.
            </p>

            <button
              onClick={() =>
                initializePayment({
                  onSuccess: handlePaymentSuccess,
                  onClose: handlePaymentClose,
                })
              }
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 mb-4"
            >
              Pay KES 150 to Unlock
            </button>

            <button
              onClick={handleLogout}
              className="text-gray-400 font-semibold hover:text-red-500 transition"
            >
              Logout and pay later
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="font-bold text-xl tracking-tight text-dark">
              NYOTA
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              activeView === "overview"
                ? "bg-brand-light text-brand"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <TrendingUp size={20} /> Overview
          </button>
          <button
            onClick={() => setActiveView("profile")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              activeView === "profile"
                ? "bg-brand-light text-brand"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <User size={20} /> Profile
          </button>
          <button
            onClick={() => setActiveView("loans")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              activeView === "loans"
                ? "bg-brand-light text-brand"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Wallet size={20} /> My Loans
          </button>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition font-medium"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT (Blurred out visually if locked, but the overlay prevents clicks anyway) */}
      <main
        className={`flex-1 p-6 md:p-10 overflow-y-auto ${isPendingPayment ? "blur-sm pointer-events-none" : ""}`}
      >
        {/* GLOBAL HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-dark capitalize">
              {activeView === "overview"
                ? `Welcome back, ${firstName}!`
                : activeView}
            </h1>
            <p className="text-gray-500 text-sm">
              Dashboard / <span className="capitalize">{activeView}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">ID: {userData.id_number}</p>
              <p className="text-xs text-brand font-medium">Verified Member</p>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <User className="text-gray-500" />
            </div>
          </div>
        </header>

        {/* VIEW: OVERVIEW */}
        {activeView === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid lg:grid-cols-3 gap-8">
            {/* DISBURSEMENT PROGRESS CARD */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold">Disbursement Chance</h3>
                  <p className="text-gray-500 text-sm">
                    Reach 100% to qualify for your KES 15,000 loan
                  </p>
                </div>
                <span className="text-3xl font-black text-brand">
                  {totalChance}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-4 rounded-full mb-8 overflow-hidden">
                <div
                  className="bg-brand h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                  style={{ width: `${totalChance}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Referrals</p>
                  <p className="font-bold">{referralCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Bonus %</p>
                  <p className="font-bold text-brand">+{referralCount * 10}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Target</p>
                  <p className="font-bold text-dark">100%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p
                    className={`font-bold text-xs uppercase ${totalChance >= 100 ? "text-green-500" : "text-orange-500"}`}
                  >
                    {totalChance >= 100 ? "Eligible" : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {/* REFERRAL CARD */}
            <div className="bg-dark text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Share2 className="text-brand" />
                </div>
                <h3 className="text-xl font-bold mb-2">Refer & Grow</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Share your unique link. Each new member registration adds 10%
                  to your loan approval chance.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs truncate mr-2 text-gray-400">
                    {referralLink}
                  </span>
                  <button
                    onClick={copyReferralLink}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    {copied ? (
                      <CheckCircle size={18} className="text-brand" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITIES TABLE */}
            <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                <History className="text-gray-400" size={20} />
                <h3 className="font-bold">Recent Referrals</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-4">Referred User</th>
                      <th className="px-6 py-4">Date Joined</th>
                      <th className="px-6 py-4">Bonus Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {userData.referral_history &&
                    userData.referral_history.length > 0 ? (
                      userData.referral_history.map((ref: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 font-medium">{ref.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(ref.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                              +10%
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-8 text-center text-gray-400 text-sm"
                        >
                          No referrals yet. Share your link to start earning
                          bonuses!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROFILE PAGE */}
        {activeView === "profile" && (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-brand-light relative"></div>
              <div className="px-8 pb-8">
                <div className="flex justify-between items-end -mt-12 mb-8">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md relative">
                    <User size={40} className="text-gray-400" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Full Name
                    </label>
                    <p className="font-semibold text-lg text-dark">
                      {userData.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Phone Number
                    </label>
                    <p className="font-semibold text-lg text-dark">
                      {userData.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      ID Number
                    </label>
                    <p className="font-semibold text-lg text-dark">
                      {userData.id_number}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                      Referral Code
                    </label>
                    <p className="font-semibold text-lg text-dark">
                      {userData.referral_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: LOANS PAGE */}
        {activeView === "loans" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid gap-6">
            <div className="bg-white border-2 border-brand-light rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand">
                  <Briefcase size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-dark">
                    Starter Business Fund
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Status: Active</p>
                </div>
              </div>
              <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Requested Amount
                </p>
                <p className="text-3xl font-black text-dark">KES 15,000</p>
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <span
                  className={`flex items-center justify-center gap-2 px-6 py-4 border rounded-2xl font-bold ${
                    totalChance >= 100
                      ? "bg-green-50 border-green-200 text-green-600"
                      : "bg-orange-50 border-orange-200 text-orange-600"
                  }`}
                >
                  {totalChance >= 100
                    ? "Ready for Review"
                    : `In Progress (${totalChance}%)`}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4 items-start">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm text-blue-800 leading-relaxed pt-1">
                Your application is currently being evaluated based on your
                network activity. Once you hit <strong>100% chance</strong> via
                your referrals, the loan will automatically be disbursed to your
                M-Pesa number <strong>{userData.phone}</strong>. Keep sharing
                your link!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
