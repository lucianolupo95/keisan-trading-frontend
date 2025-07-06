import { useState } from "react";

const TICKER_LIST = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
  "META", "NVDA", "NFLX", "AMD", "BABA",
  "BTC-USD", "ETH-USD", "EURUSD=X", "SPY", "QQQ"
];

function App() {
  const [ticker, setTicker] = useState("");
  const [interval, setInterval] = useState("1d");
  const [period, setPeriod] = useState("7d");
  const [data, setData] = useState([
    { Date: "2024-01-01", Open: 150, High: 160, Low: 145, Close: 158, Volume: 100000 },
    { Date: "2024-01-02", Open: 158, High: 162, Low: 155, Close: 160, Volume: 120000 },
  ]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!ticker || !interval || !period) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/fetch?ticker=${ticker}&interval=${interval}&period=${period}`);
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
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
    link.setAttribute("download", `${ticker || "mock"}_${interval}_${period}.csv`);
    link.click();
  };

  return (
<div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center p-4">
  <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-2xl p-6 space-y-6 overflow-y-auto h-[95vh]">
        <h1 className="text-3xl font-bold text-center text-blue-400">Keisan Trading Viewer</h1>

        <form onSubmit={handleFetch} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-semibold">Ticker (e.g. AAPL)</label>
            <input
              type="text"
              list="tickers"
              required
              placeholder="Enter ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="tickers">
              {TICKER_LIST.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Interval</label>
            <select
              required
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="1d">1d</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Period</label>
            <select
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded"
            >
              <option value="1d">1d</option>
              <option value="5d">5d</option>
              <option value="7d">7d</option>
              <option value="1mo">1mo</option>
              <option value="3mo">3mo</option>
              <option value="6mo">6mo</option>
              <option value="1y">1y</option>
              <option value="5y">5y</option>
              <option value="10y">10y</option>
              <option value="ytd">YTD</option>
              <option value="max">Max</option>
            </select>
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
                      <th key={key} className="border px-2 py-1">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="border px-2 py-1 text-white">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">Showing first 10 rows</p>
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
