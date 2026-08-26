"use client";

import { Search, X } from "lucide-react";

export function ExplorerSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (query: string) => void;
}) {
  return (
    <div className="explorer-search">
      <Search size={14} className="search-icon" />
      <input
        type="text"
        placeholder="Search files..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button className="clear-search" onClick={() => onChange("")} aria-label="Clear search">
          <X size={13} />
        </button>
      )}
    </div>
  );
}
