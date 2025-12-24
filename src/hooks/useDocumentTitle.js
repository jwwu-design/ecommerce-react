import { useLayoutEffect } from 'react';

const useDocumentTitle = (title) => {
  useLayoutEffect(() => {
    if (title) {
      document.title = title;
    } else {
      document.title = 'Ares 亞瑞仕知識學苑 - React Ecommerce Store';
    }
  }, [title]);
};

export default useDocumentTitle;
