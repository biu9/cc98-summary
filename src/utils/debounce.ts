export const debounce = <T extends Function>(
  func: T,
  delay: number,
  immediate: boolean = false
): (this: ThisParameterType<T>, ...args: any[]) => void => {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: ThisParameterType<T>, ...args: any[]) {
    const callNow = immediate && !timeout;
    if(timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      func.apply(this, args);
    }, delay);

    if (callNow) func.apply(this, args);
  };
};