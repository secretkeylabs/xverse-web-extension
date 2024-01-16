import useIntersectionObserver from '@hooks/useIntersectionObserver';
import { useRef, useState } from 'react';
import AccountRow from '.';

function LazyAccountRow(props) {
  const [shouldFetch, setShouldFetch] = useState(false);
  const ref = useRef(null);

  useIntersectionObserver(ref, () => setShouldFetch(true), {});

  return (
    <div ref={ref}>
      <AccountRow {...props} shouldFetch={shouldFetch} />
    </div>
  );
}

export default LazyAccountRow;
