import { useState } from 'react';
import { searchVideos } from '../utils/youtubeService';
import React from 'react';

export const VideoSearch = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const results = await searchVideos(query);
    setVideos(results);
    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for videos"
      />
      <button onClick={handleSearch}>Search</button>

      {loading && <p>Loading...</p>}

      <div className="video-list">
        {videos.map((video: any) => (
          <div key={video.id.videoId} className="video-item">
            <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} target="_blank" rel="noopener noreferrer">
              <img
                src={video.snippet.thumbnails.medium.url}
                alt={video.snippet.title}
                className="video-thumbnail"
              />
              <h3>{video.snippet.title}</h3>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
