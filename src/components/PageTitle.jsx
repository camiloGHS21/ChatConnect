import { useEffect } from 'react';
import { DEFAULT_PAGE_TITLE } from '@/context/constants';

const PageMetaData = ({ title }) => {
  const defaultTitle = DEFAULT_PAGE_TITLE;
  const pageTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return <title>{pageTitle}</title>;
};

export default PageMetaData;