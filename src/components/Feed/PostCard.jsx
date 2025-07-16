import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, ThumbsUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { likePost, commentOnPost } from '../../store/slices/postSlice';
import LoadingSpinner from '../common/LoadingSpinner';

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const isLiked = post.likes?.some(like => like.user === user?.id);
  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;

  const handleLike = async () => {
    await dispatch(likePost(post._id));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setCommenting(true);
    await dispatch(commentOnPost({ postId: post._id, content: comment }));
    setComment('');
    setCommenting(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3">
          {post.author?.profilePicture ? (
            <img
              src={post.author.profilePicture}
              alt={`${post.author.firstName} ${post.author.lastName}`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {post.author?.firstName} {post.author?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{post.author?.headline || 'Professional'}</p>
            <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
          </div>
          
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="px-6 pb-4">
          <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt="Post content"
                className="w-full rounded-lg object-cover max-h-96"
              />
            ))}
          </div>
        </div>
      )}

      {/* Post Video */}
      {post.video && (
        <div className="px-6 pb-4">
          <video
            src={post.video.url}
            controls
            className="w-full rounded-lg max-h-96"
          />
        </div>
      )}

      {/* Post Stats */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
            <span>{commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}</span>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-6 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Like</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Comment</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-colors">
            <Send className="h-5 w-5" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex items-start space-x-3">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Your profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <button
                  type="submit"
                  disabled={!comment.trim() || commenting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commenting ? <LoadingSpinner size="sm" color="white" /> : 'Post'}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments?.map(comment => (
              <div key={comment._id} className="flex items-start space-x-3">
                {comment.user?.profilePicture ? (
                  <img
                    src={comment.user.profilePicture}
                    alt={`${comment.user.firstName} ${comment.user.lastName}`}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">
                      {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="bg-white rounded-lg px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {comment.user?.firstName} {comment.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;