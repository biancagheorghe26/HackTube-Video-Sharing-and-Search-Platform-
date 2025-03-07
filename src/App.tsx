// App.tsx
import { useState, useEffect } from "react";
import { CategoryPills } from "./components/CategoryPills";
import { categories } from "./data/home";
import { PageHeader } from "./layouts/PageHeader";
import { Sidebar } from "./layouts/Sidebar";
import { SidebarProvider } from "./contexts/SidebarContext";
import { VideoGridItem } from "./components/VideoGridItem";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ProfilePage } from "./components/ProfilePage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import './components/UserMenu';
import { VideoPage } from "./components/VideoPage";
import { HistoryPage } from "./components/HistoryPage";
import ProtectedRoute from './components/ProtectedRoute'; // Importă ProtectedRoute
import React from "react";

const API_KEY = "AIzaSyCSfQa9FVYuUuH-4tZOLJX7KHYwN7pRUWs";

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const query = searchQuery || selectedCategory;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=16&q=${query}&key=${API_KEY}`
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
  
        const data = await response.json();
        const videoDetails = await Promise.all(
          data.items.map(async (item: any) => {
            const videoResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${item.id.videoId}&key=${API_KEY}`
            );
  
            const videoData = await videoResponse.json();
            const videoInfo = videoData.items[0];
  
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              channel: {
                id: item.snippet.channelId,
                name: item.snippet.channelTitle,
              },
              views: videoInfo.statistics.viewCount,
              postedAt: new Date(videoInfo.snippet.publishedAt),
              videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            };
          })
        );
  
        setVideos(videoDetails);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVideos();
  }, [selectedCategory, searchQuery]);
  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchQuery.trim());
  };

  const toggleUploadForm = () => {
    setIsUploadFormVisible((prev) => !prev);
  };

  const toggleUploadMethod = (method: 'file' | 'url') => {
    setUploadMethod(method);
  };

  const handleVideoUpload = async (formData: FormData) => {
    try {
      const token = localStorage.getItem("authToken");
      const username = useAuth().user?.name || ''; // Fallback to empty string if username is undefined
  
      const headers: HeadersInit = {
        "Authorization": `Bearer ${token}`,
      };
  
      if (username) {
        headers["username"] = username; // Only add username if it exists
      }
  
      const response = await fetch("http://localhost:3001/upload", {
        method: "POST",
        headers: new Headers(headers),
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Failed to upload video");
      }
  
      const data = await response.json();
      console.log("Video uploaded successfully:", data);
      setIsUploadFormVisible(false);
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route 
  path="/history" 
  element={
    <ProtectedRoute>
      <HistoryPage />
    </ProtectedRoute>
  } 
/>

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <div className="max-h-screen flex flex-col">
                  <PageHeader />
                  <div className="grid grid-cols-[auto,1fr] flex-grow overflow-auto">
                    <Sidebar toggleUploadForm={toggleUploadForm} />
                    <div className="overflow-x-hidden px-8 pb-4">
                      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for videos or music..."
                          className="border rounded px-4 py-2 w-full"
                        />
                        <button
                          type="submit"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Search
                        </button>
                      </form>
                      <div className="sticky top-0 bg-white z-10 pb-4">
                        <CategoryPills
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onSelect={setSelectedCategory}
                        />
                      </div>
                      {loading ? (
                        <p>Loading videos...</p>
                      ) : (
                        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                          {videos.map((video) => (
                            <VideoGridItem
                              key={video.id}
                              id={video.id}
                              title={video.title}
                              channel={video.channel}
                              views={video.views}
                              postedAt={video.postedAt}
                              videoUrl={video.videoUrl}
                              duration={0}
                              thumbnailUrl={""}
                            />
                          ))}
                        </div>
                      )}
                      {isUploadFormVisible && (
                        <div
                          id="upload-form"
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                        >
                          <div className="bg-white p-8 rounded shadow-lg max-w-lg w-full">
                            <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
                            <form
                              action="http://localhost:3001/upload"
                              method="POST"
                              encType="multipart/form-data"
                            >
                              <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium mb-2">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  id="title"
                                  name="title"
                                  required
                                  className="border rounded w-full px-3 py-2"
                                />
                              </div>
                              <div className="mb-4">
                                <label htmlFor="tags" className="block text-sm font-medium mb-2">
                                  Tags
                                </label>
                                <input
                                  type="text"
                                  id="tags"
                                  name="tags"
                                  required
                                  className="border rounded w-full px-3 py-2"
                                />
                              </div>
                              <div className="mb-4">
                                <div className="flex gap-4">
                                  <button
                                    type="button"
                                    className={`px-4 py-2 rounded ${uploadMethod === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                                    onClick={() => toggleUploadMethod('file')}
                                  >
                                    Upload File
                                  </button>
                                  <button
                                    type="button"
                                    className={`px-4 py-2 rounded ${uploadMethod === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                                    onClick={() => toggleUploadMethod('url')}
                                  >
                                    Provide URL
                                  </button>
                                </div>
                              </div>

                              {uploadMethod === 'file' ? (
                                <>
                                  <div className="mb-4">
                                    <label htmlFor="video" className="block text-sm font-medium mb-2">
                                      Video File
                                    </label>
                                    <input
                                      type="file"
                                      id="video"
                                      name="video"
                                      accept="video/mp4"
                                      className="border rounded w-full px-3 py-2"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="thumbnail" className="block text-sm font-medium mb-2">
                                      Thumbnail File
                                    </label>
                                    <input
                                      type="file"
                                      id="thumbnail"
                                      name="thumbnail"
                                      accept="image/jpeg"
                                      className="border rounded w-full px-3 py-2"
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="mb-4">
                                    <label htmlFor="video_url" className="block text-sm font-medium mb-2">
                                      Video URL
                                    </label>
                                    <input
                                      type="url"
                                      id="video_url"
                                      name="video_url"
                                      required
                                      className="border rounded w-full px-3 py-2"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label htmlFor="thumbnail_url" className="block text-sm font-medium mb-2">
                                      Thumbnail URL
                                    </label>
                                    <input
                                      type="url"
                                      id="thumbnail_url"
                                      name="thumbnail_url"
                                      required
                                      className="border rounded w-full px-3 py-2"
                                    />
                                  </div>
                                </>
                              )}

                              <div className="flex justify-end gap-4">
                                <button
                                  type="button"
                                  onClick={toggleUploadForm}
                                  className="px-4 py-2 bg-gray-300 rounded"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  Upload
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}
