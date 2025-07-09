import { useState } from "react";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_URL;

const TICKER_OPTIONS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "TSLA",
  "META",
  "NVDA",
  "NFLX",
  "AMD",
  "BABA",
  "BTC-USD",
  "ETH-USD",
  "EURUSD=X",
  "SPY",
  "QQQ",
].map((t) => ({ value: t, label: t }));

function App() {
  const [ticker, setTicker] = useState("");
  const [intervalAmount, setIntervalAmount] = useState("");
  const [intervalUnit, setIntervalUnit] = useState("minutes");

  const [periodAmount, setPeriodAmount] = useState("");
  const [periodUnit, setPeriodUnit] = useState("days"); // o "ytd", "max"

  const [data, setData] = useState([
    {
      Date: "2024-01-01",
      Open: 150,
      High: 160,
      Low: 145,
      Close: 158,
      Volume: 100000,
    },
    {
      Date: "2024-01-02",
      Open: 158,
      High: 162,
      Low: 155,
      Close: 160,
      Volume: 120000,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async (e) => {
    e.preventDefault();
    const interval = buildInterval();
    const period = buildPeriod();
    if (!ticker || !interval || !period) {
      alert("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/fetch/?ticker=${ticker}&interval=${interval}&period=${period}`
      );

      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  const buildInterval = () => {
    const map = { minutes: "m", hours: "h", days: "d" };
    return `${intervalAmount}${map[intervalUnit]}`;
  };

  const buildPeriod = () => {
    if (periodUnit === "ytd" || periodUnit === "max") return periodUnit;
    const map = { days: "d", months: "mo", years: "y" };
    return `${periodAmount}${map[periodUnit]}`;
  };

  const downloadCSV = () => {
    if (!data.length) return;

    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${ticker || "mock"}_${interval}_${period}.csv`
    );
    link.click();
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6 overflow-y-auto h-[95vh]">
        <h1 className="text-3xl font-bold text-center text-blue-400">
          Keisan Trading Viewer
        </h1>

        <form onSubmit={handleFetch} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-semibold">
              Ticker (e.g. AAPL)
            </label>
            <div>
              <label className="block mb-1 text-sm font-semibold">Ticker</label>
              <Select
                options={TICKER_OPTIONS}
                onChange={(selected) => setTicker(selected?.value || "")}
                className="text-white"
                classNamePrefix="react-select"
                placeholder="Select a ticker"
                isClearable
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 6,
                  colors: {
                    ...theme.colors,
                    primary25: "#374151", // hover
                    primary: "#3b82f6", // selected border
                    neutral0: "#1f2937", // input bg
                    neutral80: "white", // text color
                    neutral20: "#6b7280", // border
                    neutral30: "#9ca3af", // border hover
                  },
                })}
                styles={{
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1f2937", // fondo del dropdown
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused
                      ? "#374151"
                      : state.isSelected
                      ? "#3b82f6"
                      : "#1f2937",
                    color: "white",
                    cursor: "pointer",
                  }),
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "#1f2937",
                    color: "white",
                    borderColor: "#4b5563",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "white",
                  }),
                }}
              />
            </div>
          </div>

          {/* INTERVAL */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Interval</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                required
                value={intervalAmount}
                onChange={(e) => setIntervalAmount(e.target.value)}
                placeholder="e.g. 5"
                className="w-1/2 bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
              />
              <select
                required
                value={intervalUnit}
                onChange={(e) => setIntervalUnit(e.target.value)}
                className="w-1/2 bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          {/* PERIOD */}
          <div>
            <label className="block mb-1 text-sm font-semibold">Period</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                disabled={periodUnit === "ytd" || periodUnit === "max"}
                required={periodUnit !== "ytd" && periodUnit !== "max"}
                value={periodAmount}
                onChange={(e) => setPeriodAmount(e.target.value)}
                placeholder="e.g. 7"
                className="w-1/2 bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
              />
              <select
                required
                value={periodUnit}
                onChange={(e) => setPeriodUnit(e.target.value)}
                className="w-1/2 bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
              >
                <option value="days">Days</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
                <option value="ytd">YTD</option>
                <option value="max">Max</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
          >
            {loading ? "Loading..." : "Fetch Data"}
          </button>
        </form>

        {data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-600 text-sm mt-6">
                <thead className="bg-gray-700 text-blue-300">
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="border px-2 py-1">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="border px-2 py-1 text-white">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">
                Showing first 10 rows
              </p>
            </div>

            <button
              onClick={downloadCSV}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              Download CSV
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
