import { sendRequest } from "../apiService";

interface cellData {
  id: number;
  name: string;
  image: string;
  category: string;
  label: string;
  price: string;
  description: string;
}
export const getTableDataApi = async () => {
  try {
    const res = await sendRequest<cellData>({
      // should be ideally in .env file or in config file
      url: "https://s3-ap-southeast-1.amazonaws.com/he-public-data/reciped9d7b8c.json",
      options: {
        method: "GET",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error while fetching table data : ", error);
  }
};
