export default function getPercentage(value, array) {
  const denominator = array.reduce((acc, current) => {
    return acc + current.COUNT_VALUE;
  }, 0);
  return (value / denominator).toFixed(3) * 100 + " %";
}
