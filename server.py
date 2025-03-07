import os
import uuid
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import requests
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configurare fișiere și directoare
app.config['UPLOAD_FOLDER'] = 'uploaded_videos'
app.config['THUMBNAIL_FOLDER'] = 'uploaded_thumbnails'
LIKES_FILE = 'video_likes.json'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['THUMBNAIL_FOLDER'], exist_ok=True)

YOUTUBE_API_KEY = 'AIzaSyCSfQa9FVYuUuH-4tZOLJX7KHYwN7pRUWs'

@app.route('/search', methods=['GET'])
def search_videos():
    query = request.args.get('query', '')
    url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&q={query}&key={YOUTUBE_API_KEY}&maxResults=10'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # Încarcă datele despre like-uri
        try:
            with open(LIKES_FILE, 'r') as f:
                likes_data = json.load(f)
        except FileNotFoundError:
            likes_data = {}
        
        videos = [
            {
                'id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'thumbnailUrl': item['snippet']['thumbnails']['high']['url'],
                'channel': {
                    'name': item['snippet']['channelTitle'],
                    'profileUrl': f'https://www.youtube.com/channel/{item["snippet"]["channelId"]}'
                },
                'videoUrl': f'https://www.youtube.com/watch?v={item["id"]["videoId"]}',
                'likes': likes_data.get(item['id']['videoId'], {}).get('count', 0)
            }
            for item in data['items'] if item['id']['kind'] == 'youtube#video'
        ]
        
        return jsonify(videos)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/videos/<video_id>/recommendations', methods=['GET'])
def get_video_recommendations(video_id):
    url = f'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id={video_id}&key={YOUTUBE_API_KEY}'
    
    try:
        response = requests.get(url)
        data = response.json()
        
        related_url = f'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&relatedToVideoId={video_id}&key={YOUTUBE_API_KEY}&maxResults=5'
        related_response = requests.get(related_url)
        related_data = related_response.json()
        
        # Încarcă like-urile
        try:
            with open(LIKES_FILE, 'r') as f:
                likes_data = json.load(f)
        except FileNotFoundError:
            likes_data = {}
        
        recommendations = [
            {
                'id': item['id']['videoId'],
                'title': item['snippet']['title'],
                'thumbnailUrl': item['snippet']['thumbnails']['high']['url'],
                'channel': {
                    'name': item['snippet']['channelTitle'],
                    'profileUrl': f'https://www.youtube.com/channel/{item["snippet"]["channelId"]}'
                },
                'videoUrl': f'https://www.youtube.com/watch?v={item["id"]["videoId"]}',
                'likes': likes_data.get(item['id']['videoId'], {}).get('count', 0)
            }
            for item in related_data['items'] if item['id']['kind'] == 'youtube#video'
        ]
        
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/videos/<video_id>/like', methods=['POST', 'GET'])
def handle_likes(video_id):
    try:
        try:
            with open(LIKES_FILE, 'r') as f:
                likes_data = json.load(f)
        except FileNotFoundError:
            likes_data = {}

        if request.method == 'POST':
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'error': 'No authorization token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            if video_id not in likes_data:
                likes_data[video_id] = {
                    'count': 0,
                    'users': []
                }
            
            if token in likes_data[video_id]['users']:
                likes_data[video_id]['users'].remove(token)
                likes_data[video_id]['count'] -= 1
                message = 'Like removed'
            else:
                likes_data[video_id]['users'].append(token)
                likes_data[video_id]['count'] += 1
                message = 'Like added'
            
            with open(LIKES_FILE, 'w') as f:
                json.dump(likes_data, f)
            
            return jsonify({
                'message': message,
                'likes': likes_data[video_id]['count']
            })
        
        elif request.method == 'GET':
            video_likes = likes_data.get(video_id, {'count': 0})
            return jsonify({'likes': video_likes['count']})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET', 'POST'])
def handle_history():
    if request.method == 'POST':
        video_data = request.json
        video_data['watchedAt'] = datetime.now().isoformat()
        
        history_file = 'video_history.json'
        try:
            with open(history_file, 'r') as f:
                history = json.load(f)
        except FileNotFoundError:
            history = []
        
        history.insert(0, video_data)
        history = history[:100]
        
        with open(history_file, 'w') as f:
            json.dump(history, f)
            
        return jsonify({'message': 'History updated successfully'})
    
    elif request.method == 'GET':
        try:
            with open('video_history.json', 'r') as f:
                history = json.load(f)
            return jsonify(history)
        except FileNotFoundError:
            return jsonify([])

if __name__ == '__main__':
    app.run(debug=True, port=3001)
