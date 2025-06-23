export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), Math.max(0, ms));
  });
};
