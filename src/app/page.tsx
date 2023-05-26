"use client";

import { Input } from "@/core-ui/Input";
import { useTableData } from "@/hooks/dataHooks";
import { cellData } from "@/interfaces";
import { useQueryClient } from "@tanstack/react-query";

import {
  GroupingState,
  useReactTable,
  getFilteredRowModel,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  getSortedRowModel,
  ExpandedState,
} from "@tanstack/react-table";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Home() {
  const [grouping, setGrouping] = useState<GroupingState>(["category"]);
  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: false,
      id: "price",
    },
    {
      desc: false,
      id: "name",
    },
  ]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [savingCounter, setSavingCounter] = useState(0);

  const { data = [], isLoading, isInitialLoading } = useTableData();

  useEffect(() => {
    if (!isInitialLoading) {
      const oldData = queryClient.getQueryData<cellData[]>(["tableData"]);
      // setting oldData as fallback when user clicks reset button
      queryClient.setQueryData<cellData[]>(["oldTableData"], oldData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoading]);

  const queryClient = useQueryClient();

  const updatePriceColumn = useCallback(
    (rowIndex: number, value: number) => {
      const row = data[rowIndex];
      const updatedRow = {
        ...row,
        price: value,
      };

      queryClient.setQueryData<cellData[]>(["tableData"], (oldData = []) => {
        const newData = [...oldData];
        newData[rowIndex] = updatedRow;
        return newData;
      });
    },
    [data]
  );

  const readFromLocalStorage = () => {
    try {
      const data = localStorage.getItem("tableData");
      const parsedData = JSON.parse(data ?? "[]");
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        queryClient.setQueryData<cellData[]>(["tableData"], parsedData);
      }
    } catch (error) {
      console.error("Error reading data from local storage");
    }
  };

  const saveToLocalStorage = () => {
    const data = queryClient.getQueryData<cellData[]>(["tableData"]);
    try {
      localStorage.setItem("tableData", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data to local storage");
    }
  };

  const resetTableData = () => {
    const oldData = queryClient.getQueryData<cellData[]>(["oldTableData"]);
    queryClient.setQueryData<cellData[]>(["tableData"], oldData);
    try {
      localStorage.removeItem("tableData");
    } catch (error) {
      console.error("Error removing data from local storage");
    }
  };

  // save to local storage when user clicks save button
  // using useEffect as saving to local storage is a blocking operation
  // and we don't want to block the UI
  useEffect(() => {
    if (savingCounter > 0) {
      saveToLocalStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savingCounter]);

  useEffect(() => {
    if (!isLoading) {
      readFromLocalStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const columns = useMemo<ColumnDef<cellData>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ getValue }) => getValue(),
        enableGrouping: false,
        aggregatedCell() {
          return null;
        },
      },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ getValue }) => getValue(),
      },
      {
        header: "Image",
        accessorKey: "image",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <div className="flex flex-col items-center">
              <Image
                className="w-16 h-16 rounded"
                src={value as string}
                alt="Product Image"
                width={64}
                height={64}
              />
            </div>
          );
        },
        enableGrouping: false,
        enableSorting: false,
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ getValue }) => getValue(),
      },
      {
        header: "Label",
        accessorFn: ({ label }) => (label?.trim()?.length > 0 ? label : "N/A"),
        cell: ({ getValue }) => getValue(),
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ getValue, row }) => {
          return (
            <Input
              value={getValue() as number}
              onBlur={(val) => {
                updatePriceColumn(row.index, val);
              }}
            />
          );
        },
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ getValue }) => getValue(),
      },
    ],
    [updatePriceColumn]
  );

  const table = useReactTable<cellData>({
    data,
    columns,
    state: {
      grouping,
      sorting,
      expanded,
    },
    onGroupingChange: setGrouping,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-screen h-screen rounded">
      <table className="table-auto min-w-full h-auto divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-100 dark:bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center">
                        {header.column.getCanGroup() ? (
                          <input
                            type="checkbox"
                            className="checked:bg-blue-500 mr-2"
                            checked={header.column.getIsGrouped()}
                            title="Group by this column"
                            onChange={(e) => {
                              e.stopPropagation();
                              header.column.getToggleGroupingHandler()();
                            }}
                          />
                        ) : null}
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "" + " flex items-center "
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            // @ts-ignore
                            header?.column?.getToggleSortingHandler()(e);
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {table.getRowModel().rows.map((row) => {
            return (
              <tr
                key={row.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {row.getVisibleCells().map((cell, index) => {
                  return (
                    <td
                      {...{
                        key: cell.id,
                      }}
                      key={`td-${index}`}
                      className="py-4 px-6 text-sm font-light text-gray-900 dark:text-white"
                    >
                      {cell.getIsGrouped() ? (
                        <>
                          <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? "pointer"
                                  : "normal",
                              },
                            }}
                          >
                            {row.getIsExpanded() ? "👇" : "👉"}{" "}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}{" "}
                            ({row.subRows.length})
                          </button>
                        </>
                      ) : cell.getIsAggregated() ? (
                        flexRender(
                          cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      ) : cell.getIsPlaceholder() ? null : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* button row of rest and save button */}
      <div className="flex justify-end w-full h-16 px-4 py-2 bg-gray-100 dark:bg-gray-700">
        <button
          className="px-4 py-2 text-white bg-gradient-to-r from-red-400 to-orange-600 hover:from-red-500 hover:to-red-700 rounded"
          onClick={() => {
            resetTableData();
          }}
        >
          Reset
        </button>
        <button
          className="px-4 py-2 ml-4 text-white bg-gradient-to-r from-cyan-300 to-blue-400 hover:from-cyan-500 hover:to-blue-500 rounded"
          onClick={() => {
            setSavingCounter((old) => old + 1);
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
