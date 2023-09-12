export default splitTen = (array) => {
  let newArray = [];
  if (array.length == 0) return [];
  for (let i = 0; i < array.length; i += 10) {
    const diff = array.length - i;
    if (diff < 10) {
      newArray.push(array.slice(i, i + diff));
      return newArray;
    }
    newArray.push(array.slice(i, i + 10));
  }
};
