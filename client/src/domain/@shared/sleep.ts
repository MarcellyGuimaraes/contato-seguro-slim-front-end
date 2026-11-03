/** @see https://gist.github.com/mrienstra/8aa4eeeeab2012d2aa8ffc7f5e45f280 */
export const sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));
