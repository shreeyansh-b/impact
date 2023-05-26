import { getTableDataApi } from "@/api/table";
import { useQuery } from "@tanstack/react-query";

export const useTableData = () => {
  return useQuery(["tableData"], getTableDataApi);
};
