// utils/generateSlots.js

export function generateSlots(start, end, duration) {
  const slots = [];

  let [h, m] = start.split(":").map(Number);
  let [endH, endM] = end.split(":").map(Number);

  let current = new Date();
  current.setHours(h, m, 0);

  const endTime = new Date();
  endTime.setHours(endH, endM, 0);

  while (current < endTime) {
    const time = current.toTimeString().slice(0, 5);
    slots.push(time);

    current.setMinutes(current.getMinutes() + duration);
  }

  return slots;
}