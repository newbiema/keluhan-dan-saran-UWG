export function saveTicket(ticket) {
  const list = JSON.parse(localStorage.getItem("tickets") || "[]");
  list.unshift(ticket);
  localStorage.setItem("tickets", JSON.stringify(list.slice(0, 5)));
}

export function getLastTicket() {
  const list = JSON.parse(localStorage.getItem("tickets") || "[]");
  return list[0] || null;
}
