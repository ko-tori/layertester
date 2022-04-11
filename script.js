class LayersManager {
  constructor(sources, name, id) {
    this.sources = sources.map(s => new Audio(s));
    for (let s of this.sources) {
      s.volume = 0;
      s.loop = true;
    }
    this.sources[0].volume = 1;
    this.targetVolumes = new Array(sources.length);
    this.targetVolumes.fill(0);
    this.targetVolumes[0] = 1;
    this.name = name;
    this.id = id;
  }

  getDominantSource() {
    let volumes = this.sources.map(s => s.volume);
    return this.sources[volumes.indexOf(Math.max(...volumes))];
  }

  setActiveSource(i) {
    let n = this.sources.length;
    let ds = this.getDominantSource();
    let t = ds.currentTime;
    for (let source of this.sources) {
      if (source == ds) continue;
      source.currentTime = t;
    }

    this.targetVolumes.fill(0);
    this.targetVolumes[i] = 1;

    let buttons = document.querySelectorAll(`#${this.id} .source-button`);
    console.log(buttons);
    for (let j = 0; j < buttons.length; j++) {
      if (i == j) {
        buttons[j].classList.add('active');
      } else {
        buttons[j].classList.remove('active');
      }
    }
  }

  play() {
    let ds = this.getDominantSource();
    let t = ds.currentTime;
    for (let source of this.sources) {
      if (source == ds && !source.paused) continue;
      source.currentTime = t;
      source.play();
    }
  }

  pause() {
    for (let source of this.sources) {
      source.pause();
    }
  }

  stop() {
    for (let source of this.sources) {
      source.currentTime = 0;
      source.pause();
    }
  }

  update() {
    document.getElementById(this.id + '-time').innerHTML = this.getDominantSource().currentTime;

    for (let i = 0; i < this.sources.length; i++) {
      let t = this.targetVolumes[i];
      let s = this.sources[i];
      if (s.volume > t) {
        s.volume = Math.max(0.00, s.volume - FRAME_TIME / FADE_TIME);
      } else {
        s.volume = Math.min(1, s.volume + FRAME_TIME / FADE_TIME);
      }
    }
  }

  createElement() {
    return `<div class='sourcegroup' id='${this.id}'>
      <h3>${this.name}</h3>
      <p>
        <button id='${this.id}-play' onclick='play("${this.id}");'>Play</button>
        <button id='${this.id}-pause' onclick='pause("${this.id}");'>Pause</button>
        <button id='${this.id}-stop' onclick='stop("${this.id}");'>Stop</button>
      </p>
      <p>
        ${this.sources.map((s, i) => `<button class='${i == 0 ? 'active' : ''} source-button' onclick='setActiveSource("${this.id}", ${i});'>Variation ${i + 1}</button>`).join(' ')}
      </p>

      <p id='${this.id}-time'>0</p>
    </div>`;
  }
}

let ls = [
  new LayersManager([
    'chasm/1-1.mp3', 'chasm/1-2.mp3', 'chasm/1-3.mp3'
  ], 'Chasm 1', 'chasm1'),
  new LayersManager([
    'chasm/2-1.mp3', 'chasm/2-2.mp3', 'chasm/2-3.mp3'
  ], 'Chasm 2', 'chasm2'),
  new LayersManager([
    'chasm/4-1.mp3', 'chasm/4-2.mp3'
  ], 'Chasm 4', 'chasm4'),
  new LayersManager([
    'chasm/5-1.mp3', 'chasm/5-2.mp3', 'chasm/5-3.mp3'
  ], 'Chasm 5', 'chasm5'),
];

let currentActive;

const FADE_TIME = 5000; // in ms
const FRAME_TIME = 16;

function update() {
  for (let l of ls) {
    l.update();
  }
}

function play(id) {
  if (id != currentActive) {
    for (let l of ls) {
      l.pause();
    }
  }

  for (let l of ls) {
    if (l.id == id) {
      l.play();
    }
  }

  currentActive = id;
}

function pause(id) {
  for (let l of ls) {
    if (l.id == id) {
      l.pause();
    }
  }
}

function stop(id) {
  for (let l of ls) {
    if (l.id == id) {
      l.stop();
    }
  }
}

function setActiveSource(id, i) {
  for (let l of ls) {
    if (l.id == id) {
      l.setActiveSource(i);
    }
  }
  
  play(id);
}
window.onload = init;

function init() {
  for (let l of ls) {
    document.getElementById('container').innerHTML += l.createElement();
  }
  setInterval(update, FRAME_TIME);
}
