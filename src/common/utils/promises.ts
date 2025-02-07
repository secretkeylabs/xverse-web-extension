// a function that sleeps for a given amount of time (ms)
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
