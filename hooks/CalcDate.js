export function toDateTime(secs) {
  var t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(secs);
  return t;
}
export default calcDate = (dateProp) => {
  const today = new Date();
  const hh = today.getHours();
  const dd = today.getDate();
  const mm = today.getMonth();
  const yyyy = today.getFullYear();

  const theDate = toDateTime(dateProp.seconds);

  const theDay = theDate.getDate();
  const theMonth = theDate.getMonth();
  const theYear = theDate.getFullYear();

  if (yyyy > theYear) return yyyy - theYear + "y";
  else if (mm > theMonth) return mm - theMonth + "m";
  else if (dd > theDay) return dd - theDay + "d";
  else return "today";
};
