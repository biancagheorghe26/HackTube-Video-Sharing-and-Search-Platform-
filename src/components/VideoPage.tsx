import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  videoUrl: string;
  thumbnailUrl: string;
  likes?: number;
}

export function VideoPage() {
  const navigate = useNavigate();
  const { videoId } = useParams<{ videoId: string }>();
  const [videoDetails, setVideoDetails] = useState<Video | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!videoId) return;
      
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=AIzaSyCSfQa9FVYuUuH-4tZOLJX7KHYwN7pRUWs`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }

        const data = await response.json();
        const videoInfo = data.items[0];

        const videoData = {
          id: videoId,
          title: videoInfo.snippet.title,
          channelName: videoInfo.snippet.channelTitle,
          channelAvatar: `https://www.youtube.com/channel/${videoInfo.snippet.channelId}`,
          thumbnailUrl: videoInfo.snippet.thumbnails.high.url,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          likes: parseInt(videoInfo.statistics.likeCount)
        };

        setVideoDetails(videoData);
        setLocalLikes(parseInt(videoInfo.statistics.likeCount));
        saveToHistory(videoData);
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLocalLikes(prev => isLiked ? prev - 1 : prev + 1);

      const response = await fetch(`http://localhost:3001/videos/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
        setIsLiked(prev => !prev);
        setLocalLikes(prev => isLiked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const saveToHistory = async (videoData: Video) => {
    try {
      const historyData = {
        id: videoData.id,
        title: videoData.title,
        channelName: videoData.channelName,
        channelAvatar: videoData.channelAvatar,
        thumbnailUrl: videoData.thumbnailUrl,
        videoUrl: videoData.videoUrl,
        watchedAt: new Date().toISOString()
      };
  
      const response = await fetch('http://localhost:3001/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(historyData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to save to history');
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  if (!videoDetails) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="video-page p-4 max-w-4xl mx-auto relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        aria-label="Close"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </button>

      <div className="video-container mb-4">
        <iframe
          width="100%"
          height="480"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </div>
      <h1 className="text-2xl font-bold mb-4">{videoDetails.title}</h1>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <img 
            src={videoDetails.channelAvatar} 
            alt="Channel Avatar" 
            className="w-12 h-12 rounded-full"
          />
          <span className="font-medium">{videoDetails.channelName}</span>
        </div>
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
            isLiked ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <svg 
            className="w-6 h-6" 
            fill={isLiked ? "white" : "currentColor"} 
            viewBox="0 0 24 24"
          >
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
          </svg>
          <span>{localLikes.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
}
