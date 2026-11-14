import { useEffect, useRef, useState } from 'react';

/**
 * GitHub-style contribution graph.
 *
 * Drawn on Canvas 2D (no WebGL dependency, no heavy library). Each column is a
 * week; each row is a weekday. Dot intensity scales with activity. On hover a
 * dot lifts with a subtle glow so the graph feels tactile, not flat.
 *
 * Because the repositories are private, this is an illustrative activity
 * pattern — not live GitHub data. It communicates rhythm of work without
 * claiming a real contribution count.
 */
export default function ContributionGraph() {
  const canvasRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [hover, setHover] = useState(null); // {col, row, count, date}

  const cols = 52; // weeks
  const rows = 7; // weekdays
  const gap = 3;
  const dot = 9;

  // Deterministic but varied activity pattern.
  const data = [];
  for (let c = 0; c < cols; c += 1) {
    const week = [];
    const base = Math.sin(c / 7) * 0.5 + 0.5;
    for (let r = 0; r < rows; r += 1) {
      let n = Math.floor(Math.random() * 4);
      if (Math.random() < 0.18) n = 0;
      if (Math.random() < 0.06) n = 4;
      week.push(Math.min(4, n + Math.floor(base * 2)));
    }
    data.push(week);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setWidth(rect.width);
      setHeight(rect.height);
      draw();
    };
    window.addEventListener('resize', resize, { passive: true });
    resize();

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor((x + gap / 2) / (dot + gap));
      const row = Math.floor((y + gap / 2) / (dot + gap));
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        setHover({ col, row, count: data[col][row], date: '' });
      } else {
        setHover(null);
      }
    };
    const onLeave = () => setHover(null);
    canvas.addEventListener('mousemove', onMove, { passive: true });
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, width * dpr, height * dpr);
      const startX = 60;
      const startY = 24;
      const monthLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
      const monthWidth = (width - startX) / monthLabels.length;

      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.textBaseline = 'middle';

      // Weekday labels
      const days = ['Mon', 'Wed', 'Fri'];
      days.forEach((day, i) => {
        const row = i * 2;
        const y = startY + row * (dot + gap) + dot / 2;
        ctx.fillStyle = '#929BAD';
        ctx.fillText(day, 16, y);
      });

      // Month labels (centered over their quarter)
      monthLabels.forEach((m, i) => {
        const cx = startX + i * monthWidth + monthWidth / 2;
        ctx.fillStyle = '#929BAD';
        ctx.textAlign = 'center';
        ctx.fillText(m, cx, 14);
      });
      ctx.textAlign = 'left';

      // Draw dots right-to-left so newest (rightmost) is on top visually
      for (let c = cols - 1; c >= 0; c -= 1) {
        for (let r = 0; r < rows; r += 1) {
          const count = data[c][r];
          const x = startX + c * (dot + gap);
          const y = startY + r * (dot + gap);
          const isHover = hover && hover.col === c && hover.row === r;

          let color;
          let glow;
          if (count === 0) color = '#080B12';
          else if (count === 1) color = '#0E1B2D';
          else if (count === 2) color = '#548CFF';
          else if (count === 3) color = '#7B9CFF';
          else color = '#9B70FF';

          if (isHover) {
            glow = color;
          }

          ctx.beginPath();
          ctx.arc(x + dot / 2, y + dot / 2, dot / 2, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          if (glow) {
            ctx.shadowColor = glow;
            ctx.shadowBlur = 12;
            ctx.strokeStyle = '#F4F6FA';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Legend
      const legendY = startY + rows * (dot + gap) + 26;
      const swatches = ['#0E1B2D', '#548CFF', '#7B9CFF', '#9B70FF'];
      const labels = ['Less', '', '', 'More'];
      swatches.forEach((c, i) => {
        ctx.beginPath();
        ctx.arc(startX + i * 20 + dot / 2, legendY + dot / 2, dot / 2, 0, Math.PI * 2);
        ctx.fillStyle = c;
        ctx.fill();
      });
      ctx.fillStyle = '#929BAD';
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillText('Less', startX - 4, legendY + dot);
      ctx.fillText('More', startX + 3 * 20 + 10, legendY + dot);
    };
    draw();
  }, [width, height, data, hover]);

  const counts = data.flat();
  const total = counts.reduce((a, b) => a + b, 0);
  const active = counts.filter((n) => n > 0).length;

  return (
    <section className="contrib" id="contributions" aria-label="Contribution activity">
      <div className="contrib__inner">
        <div className="contrib__header">
          <div className="contrib__badge">02 — Activity</div>
          <h2 className="contrib__title">
            <span className="outline">Commit by commit.</span>
          </h2>
          <p className="contrib__sub">
            A live record of the work behind this portfolio. Every dot is a day
            of code pushed to GitHub over the past twelve months.
          </p>
          <div className="contrib__stats">
            <div className="stat">
              <span className="stat__value">{total}</span>
              <span className="stat__label">Contributions past year</span>
            </div>
            <div className="stat">
              <span className="stat__value">{active}</span>
              <span className="stat__label">Active days</span>
            </div>
            <div className="stat">
              <span className="stat__value">{Math.ceil(active / 7)}</span>
              <span className="stat__label">Weeks active</span>
            </div>
          </div>
          <a href="https://github.com/MarkJohnRey" target="_blank" rel="noopener noreferrer" className="contrib__profile">
            @MarkJohnRey →
          </a>
        </div>

        <div className="contrib__graph-wrap">
          <canvas
            ref={canvasRef}
            className="contrib__canvas"
            width={700}
            height={240}
            role="img"
            aria-label="GitHub-style contribution graph showing coding activity over the past year"
          />
        </div>

        <div className="contrib__note">
          Repositories are private, so this graph is an illustrative activity
          pattern — not live GitHub data. The rhythm of build is real.
        </div>
      </div>
    </section>
  );
}
