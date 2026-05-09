import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../utils/api"; // Import our new central API utility
import { usePaystackPayment } from "react-paystack";
// import { useNavigate } from "react-router-dom";
// import api from "../utils/api"; // Your Axios instance

// --- Zod Validation Schemas ---
const registerSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  phoneNumber: z
    .string()
    .regex(/^0[0-9]{9}$/, "Must be a valid 10-digit number starting with 0"),
  idNumber: z.string().min(5, "ID is too short"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  educationLevel: z.string().min(1, "Please select education level"),
  county: z.string().min(2, "County is required"),
  referredByCode: z.string().optional(),
});
type RegisterValues = z.infer<typeof registerSchema>;

const loginSchema = z.object({
  phoneNumber: z.string().regex(/^0[0-9]{9}$/, "Invalid phone format"),
  password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof loginSchema>;

interface Program {
  id: number;
  title: string;
  serviceFee: number;
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  program,
}: ApplicationModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [apiError, setApiError] = useState("");

  const isGeneralReg = !program;
  const amountToPay = isGeneralReg ? 150 : program.serviceFee;
  const formTitle = isLoginMode
    ? "Welcome Back"
    : isGeneralReg
      ? "General Registration"
      : `Apply: ${program.title}`;

  // React Hook Form for Registration
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  // React Hook Form for Login
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  // Auto-fill referral code from URL (e.g., ?ref=REF-12345)
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      registerForm.setValue("referredByCode", refCode);
    }
  }, [searchParams, registerForm]);

  if (!isOpen) return null;

  // --- 1. PAYSTACK CONFIGURATION ---
  // Paystack amounts are in cents/lowest denomination. KES 150 = 15000
  const paystackConfig = {
    email: "payment@nyotafund.com", // Dummy email since we don't collect one
    amount: 15000,
    currency: "KES",
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  // --- HELPER TO SAFELY EXTRACT ERRORS ---
  const getErrorMessage = (error: any, defaultMsg: string) => {
    const errData = error.response?.data?.error;
    if (typeof errData === "string") return errData;
    if (Array.isArray(errData) && errData.length > 0) {
      return `${errData[0].path[0]}: ${errData[0].message}`;
    }
    if (errData?.message) return errData.message;
    return defaultMsg;
  };

  // --- HANDLE REGISTRATION & PAYMENT MODAL ---
  const onRegisterSubmit = async (data: RegisterValues) => {
    setApiError("");

    try {
      // 1. Register the user (Status is automatically 'PENDING_PAYMENT' in DB)
      await api.post("/register", {
        name: data.fullName,
        phone: data.phoneNumber,
        idNumber: data.idNumber,
        password: data.password,
        county: data.county,
        educationLevel: data.educationLevel,
        referredByCode: data.referredByCode,
      });

      // 2. Automatically log them in to get the token
      const loginRes = await api.post("/login", {
        phone: data.phoneNumber,
        password: data.password,
      });
      localStorage.setItem("token", loginRes.data.token);

      // 3. Trigger Paystack Inline Modal
      const onSuccess = (transaction: any) => {
        // We will send this reference to the backend to verify later!
        console.log("Payment Successful! Reference:", transaction.reference);
        onClose();
        navigate("/dashboard");
      };

      const onCloseModal = () => {
        console.log("User closed Paystack without paying.");
        onClose();
        navigate("/dashboard"); // They go to dashboard, but will be locked out
      };

      // Open the modal!
      initializePayment({
        onSuccess,
        onClose: onCloseModal,
      });
    } catch (error: any) {
      setApiError(
        getErrorMessage(error, "Registration failed. Please try again."),
      );
    } finally {
      // Form submission state is automatically handled by React Hook Form
    }
  };

  // --- HANDLE LOGIN ---
  const onLoginSubmit = async (data: LoginValues) => {
    setApiError("");
    try {
      const res = await api.post("/login", {
        phone: data.phoneNumber,
        password: data.password,
      });

      localStorage.setItem("token", res.data.token);
      onClose();

      // Check the role and navigate
      if (res.data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      setApiError("Invalid credentials.");
    }
  };

  const isProcessing =
    registerForm.formState.isSubmitting || loginForm.formState.isSubmitting;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-brand-light p-4 flex justify-between items-center border-b border-brand/20">
          <h3 className="font-bold text-lg text-dark">{formTitle}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white rounded-full transition text-gray-500 hover:text-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
              {apiError}
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          {isLoginMode ? (
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...loginForm.register("phoneNumber")}
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  placeholder="07XX XXX XXX"
                />
                {loginForm.formState.errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {loginForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  {...loginForm.register("password")}
                  type="password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  placeholder="••••••••"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login to Dashboard"
                )}
              </button>
            </form>
          ) : (
            /* ================= REGISTRATION FORM ================= */
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...registerForm.register("fullName")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
                  placeholder="John Doe"
                />
                {registerForm.formState.errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {registerForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    {...registerForm.register("phoneNumber")}
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                    placeholder="07XX..."
                  />
                  {registerForm.formState.errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerForm.formState.errors.phoneNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number
                  </label>
                  <input
                    {...registerForm.register("idNumber")}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                    placeholder="12345678"
                  />
                  {registerForm.formState.errors.idNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerForm.formState.errors.idNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Create Password
                </label>
                <input
                  {...registerForm.register("password")}
                  type="password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                  placeholder="••••••••"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>
                  <select
                    {...registerForm.register("educationLevel")}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="None">None</option>
                    <option value="Highschool">Highschool</option>
                    <option value="University">University</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    County
                  </label>
                  <input
                    {...registerForm.register("county")}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand outline-none"
                    placeholder="Nairobi"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-6 bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  `Register & Pay (KES ${amountToPay})`
                )}
              </button>
            </form>
          )}

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600">
              {isLoginMode
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setApiError("");
                }}
                className="font-bold text-brand hover:underline"
              >
                {isLoginMode ? "Register here" : "Login here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from 'react';
// import { X, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// interface Program {
//   id: number;
//   title: string;
//   serviceFee: number;
// }

// interface ApplicationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   program: Program | null; // If null, it's a general registration
// }

// export default function ApplicationModal({ isOpen, onClose, program }: ApplicationModalProps) {
//   const navigate = useNavigate(); // 2. Initialize the hook
//     const [step, setStep] = useState<1 | 2 | 3>(1);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: '',
//     phoneNumber: '',
//     idNumber: '',
//     educationLevel: '',
//     county: ''
//   });

//   if (!isOpen) return null;

//   const isGeneralReg = !program;
//   const amountToPay = isGeneralReg ? 150 : program.serviceFee;
//   const formTitle = isGeneralReg ? "General Registration" : `Apply: ${program.title}`;

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleDetailsSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setStep(2); // Move to payment
//   };

//   const handlePayment = () => {
//     setIsProcessing(true);
//     // Simulate M-Pesa STK Push delay
//     setTimeout(() => {
//       setIsProcessing(false);
//       setStep(3); // Move to success
//     }, 3000);
//   };

//   const resetAndClose = () => {
//     setStep(1);
//     setFormData({ fullName: '', phoneNumber: '', idNumber: '', educationLevel: '', county: '' });
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">

//         {/* Header */}
//         <div className="bg-brand-light p-4 flex justify-between items-center border-b border-brand/20">
//           <h3 className="font-bold text-lg text-dark">{formTitle}</h3>
//           <button onClick={resetAndClose} className="p-1 hover:bg-white rounded-full transition text-gray-500 hover:text-dark">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-6">
//           {/* STEP 1: User Details */}
//           {step === 1 && (
//             <form onSubmit={handleDetailsSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                 <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition" placeholder="John Doe" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Phone Number</label>
//                 <input required type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition" placeholder="07XX XXX XXX" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
//                 <input required type="text" name="idNumber" value={formData.idNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition" placeholder="12345678" />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
//                   <select required name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition bg-white">
//                     <option value="">Select...</option>
//                     <option value="None">None</option>
//                     <option value="Highschool">Highschool</option>
//                     <option value="University">University</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
//                   <input required type="text" name="county" value={formData.county} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition" placeholder="e.g. Nairobi" />
//                 </div>
//               </div>
//               <button type="submit" className="w-full mt-6 bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition shadow-md">
//                 Proceed to Payment (KES {amountToPay})
//               </button>
//             </form>
//           )}

//           {/* STEP 2: Payment Prompt */}
//           {step === 2 && (
//             <div className="text-center py-6">
//               <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
//                 <Smartphone className="w-8 h-8" />
//               </div>
//               <h4 className="text-xl font-bold mb-2">M-Pesa Payment</h4>
//               <p className="text-gray-600 mb-6 text-sm">
//                 You are about to pay <strong>KES {amountToPay}</strong>.<br/>
//                 We will send an M-Pesa prompt to <strong>{formData.phoneNumber}</strong>.
//               </p>

//               <button
//                 onClick={handlePayment}
//                 disabled={isProcessing}
//                 className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
//               >
//                 {isProcessing ? (
//                   <><Loader2 className="w-5 h-5 animate-spin" /> Awaiting PIN...</>
//                 ) : (
//                   "Send Payment Prompt"
//                 )}
//               </button>

//               {!isProcessing && (
//                 <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-500 hover:text-dark transition">
//                   Back to Details
//                 </button>
//               )}
//             </div>
//           )}

//           {/* STEP 3: Success */}
// {step === 3 && (
//     <div className="text-center py-6">
//       <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand">
//         <CheckCircle2 className="w-8 h-8" />
//       </div>
//       <h4 className="text-xl font-bold mb-2">Payment Successful!</h4>
//       <p className="text-gray-600 mb-6 text-sm">
//         Your payment of KES {amountToPay} has been received. Your dashboard is now ready.
//       </p>
//       <button
//         onClick={() => {
//           resetAndClose();
//           navigate('/dashboard'); // This pushes the user to the dashboard route!
//         }}
//         className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition shadow-md"
//       >
//         Go to Dashboard
//       </button>
//     </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
