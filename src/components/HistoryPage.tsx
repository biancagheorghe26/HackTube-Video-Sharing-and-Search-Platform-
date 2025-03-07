import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  thumbnailUrl: string;
  videoUrl: string;
  watchedAt: string;
}

export function HistoryPage() {
  const [history, setHistory] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:3001/history');
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await response.json();
        // Sortăm după data vizionării, cele mai recente primul
        const sortedHistory = data.sort((a: Video, b: Video) => 
          new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
        );
        setHistory(sortedHistory);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Istoric Vizionări</h1>
      {history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Nu ai vizionat niciun video încă.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((video) => (
            <div 
              key={video.id} 
              onClick={() => handleVideoClick(video.id)}
              className="flex gap-4 p-4 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-200"
            >
              <div className="flex-shrink-0">
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title} 
                  className="w-48 h-28 object-cover rounded"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{video.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <img 
                    src={video.channelAvatar} 
                    alt={video.channelName} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-600">{video.channelName}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Vizionat la: {new Date(video.watchedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
