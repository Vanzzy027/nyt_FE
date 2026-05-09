import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  DollarSign,
  BarChart3,
  Download,
  Plus,
  ShieldAlert,
  Trash2,
  LogOut,
  Filter,
} from "lucide-react";
import api from "../utils/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");
  const [userFilter, setUserFilter] = useState<
    "ALL" | "ACTIVE" | "PENDING_PAYMENT"
  >("ALL");

  // Real Data States
  const [stats, setStats] = useState({ revenue: 0, users: 0, packages: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPkg, setNewPkg] = useState({
    title: "",
    description: "",
    target: "",
    amount: "",
    service_fee: 0,
    is_hot: false,
    icon_name: "briefcase",
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const dashRes = await api.get("/admin/dashboard");
      setStats(dashRes.data.data.stats);
      setTransactions(dashRes.data.data.transactions);

      const pkgRes = await api.get("/packages");
      setPackages(pkgRes.data.data);

      const usersRes = await api.get("/admin/users");
      setAllUsers(usersRes.data.data);

      setIsLoading(false);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Admin Access Denied.");
        navigate("/");
      }
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/packages", newPkg);
      setShowAddForm(false);
      fetchAdminData();
    } catch (error) {
      alert("Failed to add package");
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/packages/${id}`);
      fetchAdminData();
    } catch (error) {
      alert("Failed to delete package");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Filter the users array based on the dropdown selection
  const filteredUsers = allUsers.filter((u) =>
    userFilter === "ALL" ? true : u.account_status === userFilter,
  );

  if (isLoading)
    return (
      <div className="p-10 text-center font-bold">Loading Admin Matrix...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 text-dark">
      {/* TOP NAV */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-brand w-6 h-6" />
          <h2 className="font-bold text-lg tracking-tight">
            NYOTA <span className="text-gray-400">ADMIN</span>
          </h2>
        </div>

        {/* TABS */}
        <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === "overview" ? "bg-white shadow-sm text-brand" : "text-gray-500 hover:text-dark"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${activeTab === "users" ? "bg-white shadow-sm text-brand" : "text-gray-500 hover:text-dark"}`}
          >
            Registered Users
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Total Revenue
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    KES {stats.revenue}
                  </h3>
                </div>
                <div className="p-4 bg-green-50 text-green-600 rounded-full">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Active Users
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{stats.users}</h3>
                </div>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                  <Users size={24} />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Active Packages
                  </p>
                  <h3 className="text-3xl font-bold mt-1">{stats.packages}</h3>
                </div>
                <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* PACKAGE MANAGEMENT */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Manage Packages</h3>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="bg-brand text-white p-2 rounded-lg hover:bg-green-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {showAddForm && (
                    <form
                      onSubmit={handleAddPackage}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 space-y-3 text-sm"
                    >
                      <input
                        required
                        placeholder="Title"
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          setNewPkg({ ...newPkg, title: e.target.value })
                        }
                      />
                      <input
                        required
                        placeholder="Amount (e.g. KES 10,000)"
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          setNewPkg({ ...newPkg, amount: e.target.value })
                        }
                      />
                      <input
                        required
                        placeholder="Target Audience"
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          setNewPkg({ ...newPkg, target: e.target.value })
                        }
                      />
                      <input
                        required
                        type="number"
                        placeholder="Service Fee (KES)"
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          setNewPkg({
                            ...newPkg,
                            service_fee: Number(e.target.value),
                          })
                        }
                      />
                      <textarea
                        required
                        placeholder="Description"
                        className="w-full p-2 border rounded"
                        onChange={(e) =>
                          setNewPkg({ ...newPkg, description: e.target.value })
                        }
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setNewPkg({ ...newPkg, is_hot: e.target.checked })
                          }
                        />{" "}
                        Mark as HOT 🔥
                      </label>
                      <button
                        type="submit"
                        className="w-full bg-dark text-white py-2 rounded font-bold"
                      >
                        Save
                      </button>
                    </form>
                  )}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="border border-gray-100 p-4 rounded-xl relative hover:border-brand transition"
                      >
                        <h4 className="font-bold text-sm">{pkg.title}</h4>
                        <p className="text-brand font-bold text-xs">
                          {pkg.amount} (Fee: KES {pkg.service_fee})
                        </p>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT TRANSACTIONS */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold">Recent Transactions</h3>
                  <button className="flex items-center gap-2 text-xs font-bold text-brand hover:bg-brand-light px-3 py-2 rounded-lg transition">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold">
                      <tr>
                        <th className="px-6 py-4">Ref / Date</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.length > 0 ? (
                        transactions.map((tx) => (
                          <tr
                            key={tx.id}
                            className="hover:bg-gray-50/50 transition"
                          >
                            <td className="px-6 py-4">
                              <p className="font-mono text-xs text-gray-400">
                                {tx.paystack_reference}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-sm">{tx.name}</p>
                              <p className="text-xs text-gray-400">
                                {tx.phone}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium">
                              <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-brand">
                              KES {tx.amount}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-10 text-gray-400"
                          >
                            No transactions yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: USERS DIRECTORY */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg">User Directory</h3>

              {/* FILTER DROPDOWN */}
              <div className="flex items-center gap-3">
                <Filter size={16} className="text-gray-400" />
                <select
                  className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-brand font-medium"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value as any)}
                >
                  <option value="ALL">All Users</option>
                  <option value="ACTIVE">Paid (Active)</option>
                  <option value="PENDING_PAYMENT">Unpaid (Pending)</option>
                </select>
                <button className="flex items-center gap-2 text-xs font-bold text-brand hover:bg-brand-light px-3 py-2 rounded-lg transition bg-white border border-gray-200">
                  <Download className="w-4 h-4" /> Export Directory
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Name / Contact</th>
                    <th className="px-6 py-4">ID Number</th>
                    <th className="px-6 py-4">County</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">
                      Disbursement Chance
                    </th>
                    <th className="px-6 py-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {user.phone}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                          {user.id_number}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-600">
                          {user.county}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">
                          {user.account_status === "ACTIVE" ? (
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded">
                              UNPAID
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-brand bg-brand-light px-3 py-1 rounded-full text-xs">
                            {user.disbursement_chance}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-400"
                      >
                        No users match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
