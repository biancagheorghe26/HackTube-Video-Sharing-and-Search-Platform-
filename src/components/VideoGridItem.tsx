import React from "react";
import { useNavigate } from "react-router-dom";

interface VideoGridItemProps {
  id: string;
  title: string;
  channel: { id: string; name: string; profileUrl: string };
  views: number;
  postedAt: Date;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
}

export const VideoGridItem: React.FC<VideoGridItemProps> = ({
  id,
  title,
  channel,
  views,
  postedAt,
  thumbnailUrl,
}) => {
  const navigate = useNavigate();

  const handleVideoClick = () => {
    navigate(`/video/${id}`);
  };

  return (
    <div 
      className="video-item cursor-pointer hover:opacity-90 transition-opacity"
      onClick={handleVideoClick}
    >
      <div className="relative">
        <img 
          src={thumbnailUrl || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt={title}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600">Channel: {channel.name}</p>
        <p className="text-sm text-gray-600">Views: {views.toLocaleString()}</p>
        <p className="text-sm text-gray-600">
          Published: {postedAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
