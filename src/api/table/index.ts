import { cellData } from "@/interfaces";
import { sendRequest } from "../apiService";

export const getTableDataApi = async () => {
  try {
    const res = await sendRequest<cellData[]>({
      // should be ideally in .env file or in config file
      url: "https://s3-ap-southeast-1.amazonaws.com/he-public-data/reciped9d7b8c.json",
      options: {
        method: "GET",
      },
    });
    const data = res.data;
    const modifiedData = data.map((item) => {
      return {
        ...item,
        price: Number(item.price),
      };
    });
    return modifiedData;
  } catch (error) {
    console.error("Error while fetching table data : ", error);
  }
};
