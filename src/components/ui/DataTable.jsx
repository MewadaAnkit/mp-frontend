import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Filter,
  Download,
  MoreVertical,
  Check
} from 'lucide-react';
import { TableSkeleton } from './SkeletonLoader';
import EmptyState from './EmptyState';
import Pagination from '../common/Pagination';

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are currently no items matching your criteria.',
  emptyIcon,
  onEmptyAction,
  emptyActionLabel,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  filterControls = null,
  actions = null,
  selectable = false,
  selectedKeys = [],
  onSelectChange,
  keyField = '_id',
  pagination = null, // { page, totalPages, totalItems, onPageChange, limit }
  onRowClick,
  className = ''
}) {
  const [internalSearch, setInternalSearch] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const activeSearch = searchValue !== undefined ? searchValue : internalSearch;
  const handleSearchChange = (val) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  // Local filtering if client-side search
  const filteredData = useMemo(() => {
    if (searchValue !== undefined) {
      // Parent handles search
      return data;
    }
    if (!internalSearch.trim()) return data;

    const term = internalSearch.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const val = typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      })
    );
  }, [data, internalSearch, searchValue, columns]);

  // Local sorting if client-side sort
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = typeof sortField === 'function' ? sortField(a) : a[sortField];
      let bVal = typeof sortField === 'function' ? sortField(b) : b[sortField];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (col) => {
    if (!col.sortable) return;
    const accessor = col.sortKey || col.accessor;
    if (sortField === accessor) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(accessor);
      setSortDirection('asc');
    }
  };

  const isAllSelected =
    data.length > 0 && data.every((item) => selectedKeys.includes(item[keyField]));
  const isSomeSelected =
    selectedKeys.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (!onSelectChange) return;
    if (isAllSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(data.map((item) => item[keyField]));
    }
  };

  const handleSelectRow = (key, e) => {
    e.stopPropagation();
    if (!onSelectChange) return;
    if (selectedKeys.includes(key)) {
      onSelectChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectChange([...selectedKeys, key]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls Bar */}
      {(onSearchChange || filterControls || actions || searchValue !== undefined) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            {/* Search Box */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={activeSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
            {filterControls}
          </div>

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* Main Table Content */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={columns.length || 5} />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              onAction={onEmptyAction}
              actionLabel={emptyActionLabel}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#131b2e]/60 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    {selectable && (
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isSomeSelected;
                          }}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                    )}
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleSort(col)}
                        className={`py-3 px-4 ${col.className || ''} ${
                          col.sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {col.sortable && (
                            <span className="text-slate-400">
                              {sortField === (col.sortKey || col.accessor) ? (
                                sortDirection === 'asc' ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                )
                              ) : (
                                <ChevronsUpDown className="w-3.5 h-3.5 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                  {sortedData.map((row, rowIdx) => {
                    const rowKey = row[keyField] || rowIdx;
                    const isSelected = selectedKeys.includes(rowKey);

                    return (
                      <tr
                        key={rowKey}
                        onClick={() => onRowClick && onRowClick(row)}
                        className={`transition-colors duration-150 ${
                          onRowClick ? 'cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-900/10' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        } ${isSelected ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''}`}
                      >
                        {selectable && (
                          <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(rowKey, e)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        )}
                        {columns.map((col, colIdx) => (
                          <td key={colIdx} className={`py-3 px-4 ${col.className || ''}`}>
                            {col.render
                              ? col.render(row, rowIdx)
                              : typeof col.accessor === 'function'
                              ? col.accessor(row)
                              : row[col.accessor] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedData.map((row, rowIdx) => {
                const rowKey = row[keyField] || rowIdx;
                const isSelected = selectedKeys.includes(rowKey);

                return (
                  <div
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`p-4 space-y-2 transition-colors ${
                      onRowClick ? 'cursor-pointer active:bg-blue-50/50 dark:active:bg-blue-900/20' : ''
                    } ${isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}
                  >
                    {selectable && (
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/60">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(rowKey, e)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Select Row #{rowIdx + 1}</span>
                        </label>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {columns.map((col, colIdx) => (
                        <div
                          key={colIdx}
                          className={`${
                            colIdx === 0 || col.fullWidth ? 'col-span-2' : 'col-span-1'
                          } space-y-0.5`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            {col.mobileLabel || col.header}
                          </span>
                          <div className="text-slate-800 dark:text-slate-200 font-semibold text-xs">
                            {col.render
                              ? col.render(row, rowIdx)
                              : typeof col.accessor === 'function'
                              ? col.accessor(row)
                              : row[col.accessor] ?? '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            totalItems={pagination.totalItems}
            limit={pagination.limit}
          />
        </div>
      )}
    </div>
  );
}
