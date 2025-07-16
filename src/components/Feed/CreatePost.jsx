import React, { useState } from 'react';
import { Image, Video, Calendar, FileText, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../store/slices/postSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { createLoading } = useSelector((state) => state.posts);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append('content', content);
    
    selectedFiles.forEach((file) => {
      formData.append('media', file);
    });

    await dispatch(createPost(formData));
    setContent('');
    setSelectedFiles([]);
    setShowOptions(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              onFocus={() => setShowOptions(true)}
            />
            
            {selectedFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-600" />
                        <span className="ml-2 text-sm text-gray-600">{file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showOptions && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                <Image className="h-5 w-5" />
                <span className="text-sm font-medium">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              
              <label className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                <Video className="h-5 w-5" />
                <span className="text-sm font-medium">Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Event</span>
              </button>
              
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Article</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowOptions(false);
                  setContent('');
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={(!content.trim() && selectedFiles.length === 0) || createLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? <LoadingSpinner size="sm" color="white" /> : 'Post'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePost;