(() => {
  const v = document.getElementById('vRange');
  const d = document.getElementById('dRange');
  const vOut = document.getElementById('vOut');
  const dOut = document.getElementById('dOut');
  const retOut = document.getElementById('retOut');
  const retBar = document.getElementById('retBar');
  const betaOut = document.getElementById('betaOut');
  const lidarOut = document.getElementById('lidarOut');
  if (!v || !d) return;

  const I_THR = 0.14;

  function update() {
    const V = Number(v.value);
    const D = Number(d.value);
    const beta = 3 / V;
    const ret = Math.exp(-beta * D);
    const pct = (ret * 100).toFixed(1);
    vOut.textContent = V + ' m';
    dOut.textContent = D + ' m';
    retOut.textContent = pct + '%';
    retBar.style.width = Math.max(0, Math.min(100, ret * 100)) + '%';
    betaOut.textContent = beta.toFixed(3) + ' /m';
    const lidar = Math.log(1 / I_THR) / (2 * beta);
    lidarOut.textContent = lidar.toFixed(2) + ' m';
  }

  v.addEventListener('input', update);
  d.addEventListener('input', update);
  update();
})();
