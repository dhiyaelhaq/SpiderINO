const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let w = 0, h = 0;
let time = 0;

const { sin, cos, PI, hypot } = Math;

function rnd(a = 1, b = 0) {
  return Math.random() * (b - a) + a;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Load Solana logo image (small & crisp)
const solanaImg = new Image();
solanaImg.src = 'https://cryptologos.cc/logos/solana-sol-logo.svg';   // official clean SVG (works great on canvas)

solanaImg.onload = () => console.log('Solana logo loaded ✅');

// Create the spider
function createSpider() {
  const particles = Array.from({ length: 260 }, () => ({
    x: rnd(innerWidth),
    y: rnd(innerHeight),
    len: 0,
    r: 0
  }));

  const legs = Array.from({ length: 8 }, (_, i) => ({
    x: cos((i / 8) * PI * 2),
    y: sin((i / 8) * PI * 2)
  }));

  let targetX = innerWidth / 2;
  let targetY = innerHeight / 2;
  let x = targetX;
  let y = targetY;

  const bodySize = 17;

  return {
    follow(mx, my) {
      targetX = mx;
      targetY = my;
    },

    update(t) {
      x += (targetX - x) * 0.13;
      y += (targetY - y) * 0.13;

      const breathe = sin(t * 9) * 1.8;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;

      let attached = 0;

      particles.forEach(p => {
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = hypot(dx, dy);

        let targetLen = 0;
        let size = 18;   // size of Solana coin

        if (dist < 95 && attached < 8) {
          targetLen = 1;
          attached++;
        }

        p.len += (targetLen - p.len) * 0.22;

        if (p.len > 0.02) {
          legs.forEach(leg => {
            const legX = x + leg.x * (bodySize + breathe);
            const legY = y + leg.y * (bodySize + breathe * 0.6);

            const sx = lerp(legX, p.x, p.len * p.len);
            const sy = lerp(legY, p.y, p.len * p.len);

            ctx.beginPath();
            ctx.moveTo(sx, sy);

            for (let i = 1; i <= 75; i++) {
              const tt = i / 75;
              const lx = lerp(sx, legX, tt);
              const ly = lerp(sy, legY, tt);
              const wiggle = (sin(tt * 12) + sin(tt * 25)) * 2.2;
              ctx.lineTo(lx + wiggle, ly + wiggle);
            }
            ctx.stroke();
          });

          // === DRAW SOLANA COIN INSTEAD OF CIRCLE ===
          if (solanaImg.complete) {
            const coinSize = size * p.len;   // grows nicely when attached
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(t * 1.5);             // optional slow spin effect
            ctx.drawImage(solanaImg, -coinSize/2, -coinSize/2, coinSize, coinSize);
            ctx.restore();
          } else {
            // fallback while image loads
            ctx.fillStyle = '#14F195';       // Solana green
            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 0.6, 0, PI * 2);
            ctx.fill();
          }
        }
      });

      // Spider body (kept white/glowing)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, bodySize + breathe * 0.25, 0, PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath();
      ctx.arc(x - 6, y - 6, 7, 0, PI * 2);
      ctx.fill();
    }
  };
}

const spider = createSpider();

// Resize
function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}

// Animation loop
function loop() {
  time += 0.016;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.13)';
  ctx.fillRect(0, 0, w, h);

  spider.update(time);

  requestAnimationFrame(loop);
}

// Events
window.addEventListener('pointermove', e => {
  spider.follow(e.clientX, e.clientY);
});

window.addEventListener('resize', resize);

// Start
resize();
loop();