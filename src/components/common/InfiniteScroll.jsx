import React, { useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

const InfiniteScroll = ({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
  loader = <LoadingSpinner />,
}) => {
  const observerRef = useRef();
  const loadingRef = useRef();

  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = loadingRef.current;
    const option = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);
    if (element) observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleObserver, threshold]);

  return (
    <div>
      {children}
      {hasMore && (
        <div ref={loadingRef} className="flex justify-center py-4">
          {isLoading && loader}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;