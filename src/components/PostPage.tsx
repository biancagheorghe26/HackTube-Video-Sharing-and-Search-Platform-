import React, { useState } from "react";

export function PostPage() {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [tags, setTags] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !thumbnail || !video) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("thumbnail", thumbnail);
    formData.append("video", video);
    formData.append("tags", tags);

    try {
      const response = await fetch("http://localhost:3001/api/videos", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Token-ul utilizatorului
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      alert("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("There was an error uploading the video.");
    }
  };

  return (
    <div className="post-page">
      <h1>Upload Video</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Thumbnail:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            required
          />
        </div>
        <div>
          <label>Video:</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            required
          />
        </div>
        <div>
          <label>Tags (comma-separated):</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
