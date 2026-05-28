// Merge Sort
function mergeSort(arr, cmp = (a, b) => a - b) {
  const x = [...arr];
  const n = x.length;
  if (n <= 1) return x;
  const mid = Math.floor(n / 2); // Índice do meio para dividir o array
  const left = mergeSort(x.slice(0, mid), cmp); // Ordena a metade esquerda
  const right = mergeSort(x.slice(mid), cmp); // Ordena a metade direita
  return merge(left, right, n, cmp);
}

// Mescla dois arrays ordenados em um só
function merge(left, right, n, cmp) {
  const result = new Array(n);
  let i = 0, j = 0, k = 0;
  while (i < left.length && j < right.length) {
    if (cmp(left[i], right[j]) <= 0)
      result[k++] = left[i++]; // O menor vem da esquerda
    else
      result[k++] = right[j++]; // O menor vem da direita
  }
  // Copia os elementos restantes, se houver
  while (i < left.length) result[k++] = left[i++];
  while (j < right.length) result[k++] = right[j++];
  return result;
}
