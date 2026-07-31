import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { paymentAPI } from "../../api";

const DummyPaymentForm = ({ total, onSuccess, onBack }) => {
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [step, setStep] = useState("form"); // "form" | "processing" | "success"
  const [errors, setErrors] = useState({});

  const handle = e => {
    const { name, value } = e.target;
    let val = value;
    if (name === "number") {
      val = val.replace(/\D/g, "").slice(0, 16);
      val = val.replace(/(.{4})/g, "$1 ").trim();
    }
    if (name === "expiry") {
      val = val.replace(/\D/g, "").slice(0, 4);
      if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
    }
    if (name === "cvv") val = val.replace(/\D/g, "").slice(0, 3);
    setCard(prev => ({ ...prev, [name]: val }));
    // Clear error on type
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!card.name.trim())                              errs.name   = "Cardholder name is required.";
    if (card.number.replace(/\s/g, "").length < 16)    errs.number = "Enter a valid 16-digit card number.";
    if (card.expiry.length < 5)                        errs.expiry = "Enter a valid MM/YY expiry.";
    else {
      const [mm, yy] = card.expiry.split("/");
      const now = new Date();
      const exp = new Date(2000 + Number(yy), Number(mm) - 1);
      if (exp <= now) errs.expiry = "Card has expired.";
    }
    if (card.cvv.length < 3) errs.cvv = "Enter a 3-digit CVV.";
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStep("processing");
    try {
      const { data } = await paymentAPI.process({
        amount:     total,
        cardName:   card.name,
        cardNumber: card.number.replace(/\s/g, "").slice(-4),
      });

      if (data.success) {
        setStep("success");
        // Small delay to show success animation before proceeding
        setTimeout(() => onSuccess(data.transactionId), 1500);
      } else {
        throw new Error(data.message || "Payment declined.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Payment failed. Please try again.";
      toast.error(msg);
      setStep("form");
    }
  };

  const cardDisplay = card.number || "•••• •••• •••• ••••";

  return (
    <AnimatePresence mode="wait">
      {/* Processing */}
      {step === "processing" && (
        <motion.div
          key="processing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="py-20 text-center"
        >
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-red-300 border-b-transparent border-l-transparent"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">💳</div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
          <p className="text-gray-400 mb-6">Verifying your card details...</p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 bg-red-500 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Success */}
      {step === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
            className="w-24 h-24 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto mb-5"
          >
            <span className="text-5xl text-green-400 font-black">✓</span>
          </motion.div>
          <h3 className="text-2xl font-black text-white mb-2">Payment Approved!</h3>
          <p className="text-gray-400">Saving your booking now...</p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment form */}
      {step === "form" && (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {/* Test mode notice */}
          <div className="mb-5 p-3 bg-blue-950/50 border border-blue-700/40 rounded-xl">
            <p className="text-blue-300 text-sm font-semibold mb-1">🧪 Test Mode — No real charges</p>
            <p className="text-blue-400 text-xs">
              Card: <code className="bg-blue-900/50 px-1.5 py-0.5 rounded font-mono">4242 4242 4242 4242</code>
              &nbsp;· Expiry: <code className="bg-blue-900/50 px-1.5 py-0.5 rounded font-mono">12/28</code>
              &nbsp;· CVV: <code className="bg-blue-900/50 px-1.5 py-0.5 rounded font-mono">123</code>
            </p>
          </div>

          {/* Card preview */}
          <div className="relative h-44 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-2xl p-5 mb-6 overflow-hidden border border-gray-600">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-red-600/15 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-red-600/10 rounded-full" />
            <div className="flex justify-between items-start mb-5 relative">
              <div>
                <p className="text-yellow-400 font-bold text-sm">💳 CineMax Pay</p>
                <p className="text-gray-500 text-xs mt-0.5">VISA</p>
              </div>
              <div className="flex -space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full opacity-90" />
                <div className="w-8 h-8 bg-red-500 rounded-full opacity-90" />
              </div>
            </div>
            <p className="text-gray-200 font-mono text-xl tracking-[0.2em] relative mb-3">
              {cardDisplay}
            </p>
            <div className="flex justify-between relative">
              <p className="text-gray-400 text-xs">{card.name.toUpperCase() || "CARDHOLDER NAME"}</p>
              <p className="text-gray-400 text-xs">{card.expiry || "MM/YY"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Cardholder name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Cardholder Name</label>
              <input
                name="name"
                value={card.name}
                onChange={handle}
                placeholder="John Doe"
                autoComplete="cc-name"
                className={`w-full px-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors border ${errors.name ? "border-red-500 focus:border-red-500" : "border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"}`}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">⚠ {errors.name}</p>}
            </div>

            {/* Card number */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Card Number</label>
              <input
                name="number"
                value={card.number}
                onChange={handle}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                autoComplete="cc-number"
                inputMode="numeric"
                className={`w-full px-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors font-mono tracking-widest border ${errors.number ? "border-red-500" : "border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"}`}
              />
              {errors.number && <p className="text-red-400 text-xs mt-1">⚠ {errors.number}</p>}
            </div>

            {/* Expiry + CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Expiry Date</label>
                <input
                  name="expiry"
                  value={card.expiry}
                  onChange={handle}
                  placeholder="MM/YY"
                  maxLength={5}
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  className={`w-full px-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors border ${errors.expiry ? "border-red-500" : "border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"}`}
                />
                {errors.expiry && <p className="text-red-400 text-xs mt-1">⚠ {errors.expiry}</p>}
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">CVV</label>
                <input
                  name="cvv"
                  type="password"
                  value={card.cvv}
                  onChange={handle}
                  placeholder="•••"
                  maxLength={3}
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  className={`w-full px-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors border ${errors.cvv ? "border-red-500" : "border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500"}`}
                />
                {errors.cvv && <p className="text-red-400 text-xs mt-1">⚠ {errors.cvv}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
              >
                ← Back
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-lg shadow-red-900/40 transition-colors text-lg"
              >
                Pay ₱{Number(total).toFixed(2)}
              </motion.button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-600">
            <span>🔒 256-bit SSL</span>
            <span>🛡️ Fraud Protected</span>
            <span>💳 PCI Compliant</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DummyPaymentForm;
