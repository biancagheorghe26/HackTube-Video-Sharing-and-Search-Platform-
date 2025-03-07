import { useEffect, useState } from "react";
import { VideoGridItem } from "./VideoGridItem"; // Componenta pentru afișarea videoclipurilor
import './CategoryPills.css'
import React from "react";
const categories = ["All", "Music", "Sports", "Gaming", "News", "Education"];

export const VideoPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [videos, setVideos] = useState<any[]>([]);

  const fetchVideos = async (category: string) => {
    const query = category === "All" ? "" : category;
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${query}&key=YOUR_API_KEY`
      );
      const data = await response.json();
      if (data.items) {
        setVideos(data.items);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Fetch videos when category changes
  useEffect(() => {
    fetchVideos(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="video-page">
      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={(category: string) => setSelectedCategory(category)}
      />
      <div className="video-grid">
        {videos.map((video: any) => (
          <VideoGridItem
            key={video.id.videoId}
            id={video.id.videoId}
            title={video.snippet.title}
            channel={{
              id: video.snippet.channelId,
              name: video.snippet.channelTitle,
              profileUrl: `https://yt3.ggpht.com/ytc/${video.snippet.channelId}`,
            }}
            views={0} // Poți adăuga vizualizări dacă sunt disponibile
            postedAt={new Date(video.snippet.publishedAt)}
            thumbnailUrl={video.snippet.thumbnails.medium.url}
            videoUrl={`https://www.youtube.com/watch?v=${video.id.videoId}`}
            duration={0}
          />
        ))}
      </div>
    </div>
  );
};

type CategoryPillsProps = {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
};

const CategoryPills: React.FC<CategoryPillsProps> = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="category-pills">
      {categories.map((category) => (
        <button
          key={category}
          className={`pill ${category === selectedCategory ? "selected" : ""}`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export { CategoryPills };
