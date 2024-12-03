import axios from 'axios';

// Helper function to fetch data
export default async function fetchData(url: string): Promise<string> {
  const response = await axios.get(url);
  return response.data;
}
