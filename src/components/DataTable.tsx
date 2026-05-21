import { useState } from "react";
import { Search } from "lucide-react";

interface Props<T> {
  columns: string[];
  data: T[];
  onViewMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  hideSearch?: boolean;
}

function DataTable<T extends Record<string, any>>({ 
  columns, 
  data, 
  onViewMore, 
  hasMore = false,
  isLoadingMore = false,
  hideSearch = false 
}: Props<T>) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="card overflow-hidden">
      {/* Search & Toolbar */}
      {!hideSearch && (
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-surface-muted border border-gray-100 px-3 py-2 rounded-lg w-full sm:w-72 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-50 transition-all">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none px-2 text-sm w-full text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <p className="text-xs text-gray-400 font-medium">
            Showing {filteredData.length} records
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-muted border-b border-gray-100">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-brand-50/30 transition-colors duration-150"
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className="px-5 py-3.5 text-gray-700 whitespace-nowrap"
                    >
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-gray-400 text-sm"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View More Button */}
      {hasMore && (
        <div className="p-4 border-t border-gray-50 flex justify-center bg-gray-50/30">
          <button
            onClick={onViewMore}
            disabled={isLoadingMore}
            className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-brand-200 hover:text-brand-600 transition-all shadow-sm disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <div className="w-3 h-3 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              "View More Records"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default DataTable;