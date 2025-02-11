export const navigateTo = function (
  name: string,
  params = "",
  query = "",
  hash = ""
) {
  this.$router.push({
    name: name,
    params: params,
    query: query,
    hash: hash,
  });
};
