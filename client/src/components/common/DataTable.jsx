import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDownUp,
} from "lucide-react";

function stringifyValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
}

export default function DataTable({
  columns,
  data = [],
  searchPlaceholder = "Search records...",
  emptyMessage = "No records found",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) => {
      if (searchField) {
        const val = row[searchField];
        return val ? String(val).toLowerCase().includes(term) : false;
      }
      return Object.values(row).some((val) =>
        stringifyValue(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchField]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    const column = columns.find((col) => col.key === sortColumn);
    const accessor = column?.accessor;

    return [...filteredData].sort((a, b) => {
      const aVal = accessor ? accessor(a) : a[sortColumn];
      const bVal = accessor ? accessor(b) : b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const res = aVal > bVal ? 1 : -1;
      return sortDirection === "asc" ? res : -res;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(key);
      setSortDirection("asc");
    }
  };

  const SortIcon = sortColumn === column.key ? ArrowUpDown : ArrowDownUp;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 focus:border-brand-500/60"
          />
        </div>

        <div className="flex items-center gap-2 self-end text-xs text-slate-400">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg shadow-black/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key || col.header}
                    onClick={() => col.sortable !== false && col.key && handleSort(col.key)}
                    className={`px-5 py-3.5 cursor-pointer select-none transition-colors ${
                      col.sortable !== false && col.key
                        ? "hover:text-white/80"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {col.header}
                      </span>
                      {col.sortable !== false && col.key && (
                        <SortIcon
                          className={`w-3.5 h-3.5 transition-colors ${
                            sortColumn === col.key
                              ? "text-brand-400 opacity-100"
                              : "text-slate-500 opacity-40"
                          }`}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key || col.header}
                        className="px-5 py-3.5 text-sm text-slate-300"
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-16 text-center text-sm text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="text-xs text-slate-400">
            Showing{" "}
            {sortedData.length > 0
              ? (safePage - 1) * pageSize + 1
              : 0}{" "}
            to{" "}
            {Math.min(safePage * pageSize, sortedData.length)} of {sortedData.length}{" "}
            records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-300 px-2">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-2 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
