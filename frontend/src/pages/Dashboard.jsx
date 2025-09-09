import { motion } from "framer-motion";

export default function Dashboard({ bookings = 0, revenue = 0, messages = [] }) {
  return (
    <div className="bg-[#0e0b1f]/70 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-violet-800/50 w-full">
      <h2 className="text-xl font-bold text-violet-300 mb-4">Business Dashboard</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-700/20 backdrop-blur-sm p-4 rounded-lg text-center border border-slate-500/30">
          <p className="text-sm font-medium text-slate-300">Bookings by AI</p>
          <p className="text-3xl font-bold text-slate-200">{bookings}</p>
        </div>
        <div className="bg-gray-700/20 backdrop-blur-sm p-4 rounded-lg text-center border border-gray-500/30">
          <p className="text-sm font-medium text-gray-300">Revenue Recovered</p>
          <p className="text-3xl font-bold text-gray-200">₹{revenue.toLocaleString()}</p>
        </div>
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-400 mb-2">Live Action Log</h3>
        <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg h-40 overflow-y-auto flex flex-col gap-2 border border-slate-500/30">
          {messages.length > 0 ? (
            messages.toReversed().map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800/70 p-3 rounded-lg shadow-md border border-slate-700"
              >
                <p className="text-sm text-gray-300">{msg}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center my-auto">Waiting for calls...</p>
          )}
        </div>
      </div>
    </div>
  );
}