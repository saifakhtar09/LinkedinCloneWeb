import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, resetPosts } from '../../store/slices/postSlice';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import LoadingSpinner from '../common/LoadingSpinner';
import InfiniteScroll from '../common/InfiniteScroll';

const Feed = () => {
  const dispatch = useDispatch();
  const { posts, isLoading, hasMore, page } = useSelector((state) => state.posts);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(resetPosts());
    dispatch(fetchPosts({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      dispatch(fetchPosts({ page: page + 1, limit: 10 }));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    dispatch(resetPosts());
    await dispatch(fetchPosts({ page: 1, limit: 10 }));
    setRefreshing(false);
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex-1 max-w-2xl mx-auto">
        <CreatePost />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      <CreatePost />
      
      {refreshing && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" />
        </div>
      )}
      
      <InfiniteScroll
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
      >
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </InfiniteScroll>

      {posts.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600 mb-4">Be the first to share something with your network!</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Feed
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;