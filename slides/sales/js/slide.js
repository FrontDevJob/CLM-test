const fallbackData = {
  "sales": [
    { "year": 2021, "value": 8.5 },
    { "year": 2022, "value": 9.8 },
    { "year": 2023, "value": 11.4 },
    { "year": 2024, "value": 13.2 },
    { "year": 2025, "value": 15.6 }
  ]
};

fetch('/data/sales.json')
  .then(res => res.json())
  .catch(() => fallbackData)
  .then(json => {
    const data = json.sales;

    const svg = document.getElementById('chart');
    const tooltip = document.getElementById('tooltip');
    const viewport = document.querySelector('.viewport');

    const width = 850;
    const height = 425;
    const padding = 60;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));

    const stepX = (width - padding * 2) / (data.length - 1);

    const ySteps = 4;
    const stepValue = Math.ceil((maxValue - minValue) / ySteps);

    const yValues = [];
    for (let i = 0; i <= ySteps; i++) {
      yValues.push(minValue + stepValue * i);
    }

    const points = data.map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((d.value - minValue) / (yValues[yValues.length - 1] - minValue)) * (height - padding * 2);
      return { ...d, x, y };
    });

    yValues.forEach(val => {
      const y = height - padding - ((val - minValue) / (yValues[yValues.length - 1] - minValue)) * (height - padding * 2);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", padding);
      line.setAttribute("x2", width - padding);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      line.setAttribute("class", "grid-line");
      svg.appendChild(line);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", padding - 18);
      text.setAttribute("y", y + 4);
      text.setAttribute("text-anchor", "end");
      text.setAttribute("class", "axis-text");
      text.textContent = val > 1 ? Math.round(val) : val.toFixed(1);
      svg.appendChild(text);
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("class", "line");
    svg.appendChild(path);

    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    setTimeout(() => {
      path.style.transition = "stroke-dashoffset 1.5s ease";
      path.style.strokeDashoffset = 0;
    }, 100);

    points.forEach((p, i) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 8);
      circle.setAttribute("class", "point");
      if (i === points.length - 1) circle.classList.add("last");
      svg.appendChild(circle);

      circle.addEventListener("mouseenter", (e) => {
        const style = window.getComputedStyle(viewport);
        const transform = style.transform || style.webkitTransform;
        let scale = 1;
        if (transform && transform !== 'none') {
          const match = transform.match(/matrix\(([^,]+),/);
          if (match) scale = parseFloat(match[1]);
        }

        const rect = viewport.getBoundingClientRect();
        tooltip.innerHTML = `${p.year} — ${p.value} млн`;
        tooltip.style.left = ((e.clientX - rect.left) / scale + 10) + 'px';
        tooltip.style.top = ((e.clientY - rect.top) / scale - 20) + 'px';
        tooltip.style.opacity = 1;
      });

      circle.addEventListener("mouseleave", () => {
        tooltip.style.opacity = 0;
      });

      setTimeout(() => {
        circle.classList.add("active");
      }, 300 + i * 200);
    });

    points.forEach((p, i) => {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", p.x);
      text.setAttribute("y", height - 20);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "axis-text");
      text.textContent = data[i].year;
      svg.appendChild(text);
    });

    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yLabel.setAttribute("x", 15);
    yLabel.setAttribute("y", 20);
    yLabel.setAttribute("class", "y-label");
    yLabel.textContent = "млн упаковок";
    svg.appendChild(yLabel);
  });