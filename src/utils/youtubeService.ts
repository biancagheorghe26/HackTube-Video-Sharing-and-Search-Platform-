const API_KEY = '';  // Înlocuiește cu API Key-ul tău
const BASE_URL = '';

export const getVideoDetails = async (videoId: string) => {
  const url = `${BASE_URL}?id=${videoId}&key=${API_KEY}&part=snippet,contentDetails,statistics`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch video data');
    }
    const data = await response.json() as { items: any[] };
    return data.items[0];  // Returnează primul videoclip găsit
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};

export const searchVideos = async (query: string) => {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    const data = await response.json() as { items: any[] };
    return data.items;  // Returnează lista de rezultate ale căutării
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
};
