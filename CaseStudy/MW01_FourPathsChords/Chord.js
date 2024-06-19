function chordCreate(b, k) {
  return {base:b, keys:k}
}
function chordNotes(c) {
  const ns = [...c.keys];
  let idxH = 0, idxL = 0, nH = -1, nL = 999
  for (let i = 0; i < c.keys.length; i ++) {
    ns[i] += c.base
    if (ns[i] >= 72) { ns[i] -= 12 }
    else if (ns[i] < 60) { ns[i] +=12 }
    if (nH < ns[i]) { idxH = i; nH = ns[i] }
    if (nL > ns[i]) { idxL = i; nL = ns[i] }
  }
  const r = random(1);
  if (r < 0.2) { ns[idxL] += 12 }
  else if (r > 0.8) { ns[idxH] -= 12 }
  return ns;
}
function chordSomeNote(c) {
  return c.keys[int(random(c.keys.length))] + c.base;
}
function makePhrase(startKey) {
  let idx = 0, k = startKey, octv = 0
  while (k < scale[0]) { k += 12; octv -- }
  while (k > scale[scale.length-1]) { k -= 12; octv ++ }
  for (let i = 0; i < scale.length; i ++)
    if (scale[i] >= k) { idx = i; break }
  idx += octv * scale.length
  const phrs = [startKey]
  for (let i = 1; i < nBeatsInPhrase; i ++) {
    idx += int(random(3)) - 1;
    const ix = idx + scale.length * 3
    phrs.push(scale[ix % scale.length]
      + (int(ix / scale.length) - 3) * 12)
  }
  console.log(phrs)
  return phrs;
}
