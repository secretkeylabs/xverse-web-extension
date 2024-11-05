import React, { useEffect } from 'react';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';

// this solution is from https://github.com/timolins/react-hot-toast/issues/31
function useMaxToasts(max: number) {
  const { toasts } = useToasterStore();

  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= max) // Is toast index over limit?
      .forEach((t) => toast.remove(t.id)); // Dismiss
  }, [toasts, max]);
}

export default function ToasterComponent({
  max = 3,
  ...props
}: React.ComponentProps<typeof Toaster> & {
  max?: number;
}) {
  useMaxToasts(max);

  return <Toaster {...props} />;
}
