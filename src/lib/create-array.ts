const arrayMap: Record<number, number[]> = {};

export const createArray = (length: number) => {
  arrayMap[length] ||= arrayMap[length] || Array.from(Array(length).keys());
  return arrayMap[length];
};
