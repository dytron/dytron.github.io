// Fila O(1) para enqueue e dequeue.
function createQueue() {
  const items = [];
  let head = 0;
  return {
    enqueue(item) {
      items.push(item);
    },
    dequeue() {
      return items[head++];
    },
    isEmpty() {
      return head >= items.length;
    },
  };
}
