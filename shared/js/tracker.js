const STORAGE_KEY = 'clm_analytics';

let currentSlide = null;
let startTime = null;
let userActions = {};

let hoverData = {};
let currentHoverElement = null;
let hoverStartTime = null;

function getAnalytics() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAnalytics(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function fakeSendData(url, data, successProbability = 0.8) {
  console.log(`try send to ${url}:`, data);

  const randomValue = Math.random();

  if (randomValue <= successProbability) {
    console.log('send data');
    return true;
  } else {
    console.warn('data not send');
    return false;
  }
}

function logEvent(type, nextSlide = null, topElements = null) {
  const analytics = getAnalytics();

  const event = {
    slide: currentSlide,
    eventType: type,
    choice: nextSlide,
    timestamp: startTime,
    duration: Date.now() - startTime,
    userActions: { ...userActions },
    topHovered: topElements || null,
  };

  const success = fakeSendData('/analytics', event);

  if (success) {
    analytics.push(event);
    saveAnalytics(analytics);
  }
}

function initHoverTracking() {
  const elements = document.querySelectorAll('[data-name]');

  elements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      currentHoverElement = el.dataset.name;
      hoverStartTime = Date.now();
    });

    el.addEventListener('mouseleave', () => {
      if (!currentHoverElement || !hoverStartTime) return;

      const duration = (Date.now() - hoverStartTime) / 1000;

      hoverData[currentHoverElement] =
        (hoverData[currentHoverElement] || 0) + duration;

      currentHoverElement = null;
      hoverStartTime = null;
    });
  });
}

window.startTracking = function (slideName) {
  currentSlide = slideName;
  startTime = Date.now();
  userActions = {};

  hoverData = {};
  currentHoverElement = null;
  hoverStartTime = null;

  initHoverTracking();

  logEvent('open');
};

window.endTracking = function (nextSlide) {
  if (currentHoverElement && hoverStartTime) {
    const duration = (Date.now() - hoverStartTime) / 1000;

    hoverData[currentHoverElement] =
      (hoverData[currentHoverElement] || 0) + duration;
  }

  const topElements = getTopElements();

  logEvent('navigate', nextSlide, topElements);

  currentHoverElement = null;
  hoverStartTime = null;
  hoverData = {};
};

document.addEventListener('click', (e) => {
  const action = e.target.dataset.action || e.target.className;

  if (!userActions.clicks) {
    userActions.clicks = [];
  }

  userActions.clicks.push({
    action,
    time: Date.now(),
  });

  logEvent('click');
});

function getTopElements() {
  return Object.entries(hoverData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([element, time]) => ({
      element,
      time: Number(time.toFixed(1)),
    }));
}