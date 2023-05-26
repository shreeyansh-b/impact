"use client";

import { useTableData } from "@/hooks/datahooks";

export default function Home() {
  const { data, isLoading } = useTableData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>{JSON.stringify(data)}</div>;
}
