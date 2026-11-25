const consonant = (symbol, key, voice, place, manner, word, description, shape) => ({
  symbol, key, group: 'consonant', word, description, shape,
  name: [voice, place, manner].join(' '),
  features: { Voicing: voice, Place: place, Manner: manner },
});

const vowel = (symbol, key, height, backness, rounding, word, description, shape, formants) => ({
  symbol, key, group: 'vowel', word, description, shape, formants,
  name: [height, backness, rounding].join(' ') + ' vowel',
  features: { Height: height, Backness: backness, Lips: rounding },
});

const sounds = [
  consonant('p', 'p', 'voiceless', 'bilabial', 'stop', 'spin', 'Close both lips and release them quickly. In spin, the release has little aspiration.', 'lips'),
  consonant('pʰ', 'h', 'voiceless', 'bilabial', 'aspirated stop', 'pin', 'Close the lips, then release them with a puff of air before the vowel begins.', 'lips'),
  consonant('b', 'b', 'voiced', 'bilabial', 'stop', 'boat', 'Close both lips briefly, then release. Voicing distinguishes [b] from [p].', 'lips'),
  consonant('t', 't', 'voiceless', 'alveolar', 'stop', 'tea', 'Touch the ridge behind your upper teeth with the tongue tip, then release it.', 'ridge'),
  consonant('d', 'd', 'voiced', 'alveolar', 'stop', 'dog', 'Touch the ridge behind your upper teeth with the tongue tip, then release into voicing.', 'ridge'),
  consonant('k', 'k', 'voiceless', 'velar', 'stop', 'cat', 'Lift the back of the tongue to the soft palate to stop airflow, then release it.', 'back'),
  consonant('m', 'm', 'voiced', 'bilabial', 'nasal', 'map', 'Close both lips and let air escape through the nose while the vocal folds vibrate.', 'lips'),
  consonant('n', 'n', 'voiced', 'alveolar', 'nasal', 'pin', 'Touch the ridge behind your upper teeth and let air flow through the nose.', 'ridge'),
  consonant('ŋ', 'g', 'voiced', 'velar', 'nasal', 'sing', 'Raise the back of the tongue to the soft palate. Air flows through the nose.', 'back'),
  consonant('f', 'f', 'voiceless', 'labiodental', 'fricative', 'fish', 'Bring the lower lip close to the upper teeth so air makes friction in the narrow gap.', 'teeth'),
  consonant('s', 's', 'voiceless', 'alveolar', 'fricative', 'see', 'Bring the tongue blade near the ridge just behind the upper teeth. Air hisses through the gap.', 'groove'),
  consonant('z', 'z', 'voiced', 'alveolar', 'fricative', 'zoo', 'Make the same narrow gap as for [s] while the vocal folds vibrate.', 'groove'),
  vowel('i', 'i', 'close', 'front', 'unrounded', 'beat', 'Raise the front of your tongue toward the hard palate and keep your lips unrounded.', 'frontVowel', [300, 2270, 3000]),
  vowel('ɪ', 'y', 'near-close', 'near-front', 'unrounded', 'fish', 'Raise the front of the tongue, leaving a little more space than for [i].', 'nearFront', [420, 1950, 2650]),
  vowel('æ', 'a', 'near-open', 'front', 'unrounded', 'cat', 'Open the jaw and keep the tongue low and forward.', 'open', [720, 1720, 2500]),
  vowel('u', 'u', 'close', 'back', 'rounded', 'boot', 'Raise the back of the tongue toward the soft palate and round your lips.', 'backVowel', [310, 900, 2350]),
];

const tongueShapes = {
  lips: [263, 219, 310, 224, 358, 235],
  teeth: [268, 220, 310, 224, 358, 236],
  ridge: [268, 231, 320, 231, 371, 207],
  groove: [270, 232, 324, 229, 368, 218],
  back: [254, 177, 303, 206, 352, 240],
  frontVowel: [273, 218, 318, 200, 366, 228],
  nearFront: [273, 230, 318, 212, 363, 236],
  open: [265, 255, 320, 252, 362, 249],
  backVowel: [250, 200, 300, 203, 353, 242],
};
const locations = {
  lips: [400, 222, 'Lips'], teeth: [386, 222, 'Upper teeth'],
  ridge: [371, 207, 'Alveolar ridge'], groove: [368, 215, 'Alveolar ridge'],
  back: [280, 204, 'Soft palate'], frontVowel: [329, 215, 'Tongue front'],
  nearFront: [324, 223, 'Tongue front'], open: [315, 251, 'Low tongue'],
  backVowel: [263, 214, 'Tongue back'],
};
const $ = (selector) => document.querySelector(selector);
let selected = sounds.find(({symbol}) => symbol === 's');
let filter = 'all';
let audioContext;
let current;

function draw(sound) {
  const [x1, y1, x2, y2, x3, y3] = tongueShapes[sound.shape];
  $('#tongue').setAttribute('d', `M248 288 C235 247 ${x1} ${y1-13} ${x2} ${y2} Q${x3-18} ${y3+6} ${x3} ${y3} Q${x3+9} ${y3+9} ${x3-3} ${y3+17} C345 271 280 291 248 288Z`);
  const lip = {
    lips: 'M394 214Q405 215 404 222M394 236Q406 232 404 222',
    teeth: 'M394 214L403 217M394 235Q405 230 388 223',
    backVowel: 'M394 214Q407 210 410 220M394 236Q407 241 410 229',
    open: 'M394 211L403 215M390 246L400 243',
    default: 'M394 214L403 217M394 236L402 233',
  };
  $('#lips').setAttribute('d', lip[sound.shape] ?? lip.default);
  const [x, y, label] = locations[sound.shape];
  $('#contact').setAttribute('cx', x);
  $('#contact').setAttribute('cy', y);
  $('#location').textContent = label;
  $('#leader').setAttribute('d', `M280 33L${x} ${y-7}`);

  let flow = 'M239 302Q235 231 279 224Q335 209 375 225L438 225';
  if (sound.features.Manner === 'nasal') {
    flow = 'M239 302Q228 250 241 217Q271 165 330 180L408 192';
  } else if (sound.features.Manner?.includes('stop')) {
    flow = `M239 302Q232 242 263 228Q${x-25} ${y+8} ${x-8} ${y+2}`;
  }
  $('#flow').setAttribute('d', flow);
}

function renderTiles() {
  $('#sounds').replaceChildren(...sounds.filter(sound => filter === 'all' || sound.group === filter).map(sound => {
    const button = document.createElement('button');
    button.className = 'tile';
    button.dataset.symbol = sound.symbol;
    button.setAttribute('aria-label', `[${sound.symbol}] ${sound.name}`);
    const key = document.createElement('kbd');
    key.textContent = sound.key.toUpperCase();
    key.setAttribute('aria-hidden', 'true');
    button.append(sound.symbol, key);
    button.addEventListener('click', () => play(sound));
    return button;
  }));
  markSelected();
}

function markSelected() {
  document.querySelectorAll('.tile').forEach(tile => {
    tile.setAttribute('aria-pressed', tile.dataset.symbol === selected.symbol);
  });
}

function select(sound) {
  selected = sound;
  $('#symbol').textContent = `[${sound.symbol}]`;
  $('#name').textContent = sound.name[0].toUpperCase() + sound.name.slice(1);
  $('#description').textContent = sound.description;
  $('#key').textContent = `Key ${sound.key.toUpperCase()}`;
  $('#example').textContent = `Hear “${sound.word}”`;
  $('#features').replaceChildren(...Object.entries(sound.features).map(([term, value]) => {
    const feature = document.createElement('div');
    const label = document.createElement('dt');
    const detail = document.createElement('dd');
    label.textContent = term;
    detail.textContent = value;
    feature.append(label, detail);
    return feature;
  }));
  draw(sound);
  markSelected();
}

function synthesize(sound, context) {
  const { Manner: manner, Voicing: voice } = sound.features;
  const stop = manner?.includes('stop');
  const duration = stop ? 0.26 : 0.62;
  const sampleRate = context.sampleRate;
  const buffer = context.createBuffer(1, Math.round(sampleRate * duration), sampleRate);
  const samples = buffer.getChannelData(0);
  const nasal = manner === 'nasal';
  const formants = sound.formants ?? (nasal ? [250, 1250, 2300] : [390, 1450, 2600]);
  const f0 = 134;
  const harmonics = Array.from({length: 24}, (_, i) => {
    const frequency = f0 * (i + 1);
    const weight = formants.reduce((sum, formant, index) => {
      const distance = (frequency - formant) / [120, 155, 190][index];
      return sum + [1, .65, .35][index] * Math.exp(-distance * distance);
    }, 0);
    return { frequency, weight: (weight + .035) / Math.sqrt(i + 1) };
  });
  let previousNoise = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    const noise = Math.random() * 2 - 1;
    const hiss = noise - previousNoise * (sound.symbol === 'f' ? .28 : .85);
    previousNoise = noise;
    let value = 0;
    if (sound.formants || nasal || voice === 'voiced') {
      const buzz = Math.sin(2 * Math.PI * f0 * t);
      if (stop) value = .12 * buzz * Math.exp(-t * 14);
      else if (manner === 'fricative') value = .18 * buzz;
      else value = .38 * harmonics.reduce((sum, {frequency, weight}) =>
        sum + weight * Math.sin(2 * Math.PI * frequency * t), 0);
    }
    if (manner === 'fricative') value += hiss * (sound.symbol === 'f' ? .14 : .28);
    if (stop && t >= .036) {
      const release = t - .036;
      value += .55 * hiss * Math.exp(-release * (sound.symbol === 'pʰ' ? 19 : 115));
    }
    const envelope = Math.min(1, t / .027, (duration - t) / .055);
    samples[i] = value * envelope;
  }
  return buffer;
}

async function play(sound, word) {
  if (current) current.stop();
  if (selected !== sound) select(sound);
  const playback = { stop() {} };
  current = playback;
  const status = $('#audio-status');
  status.textContent = word ? `Playing “${word}”` : `Playing [${sound.symbol}]`;
  $('.stage').classList.add('playing');
  const finish = (message = '') => {
    if (current !== playback) return;
    current = null;
    status.textContent = message;
    $('.stage').classList.remove('playing');
  };
  try {
    if (word) {
      const audio = new Audio(`audio/${word}.mp3`);
      playback.stop = () => audio.pause();
      audio.addEventListener('ended', () => finish(), { once: true });
      audio.addEventListener('error', () => finish('Example audio could not play.'), { once: true });
      await audio.play();
    } else {
      audioContext ??= new AudioContext();
      await audioContext.resume();
      if (current !== playback) return;
      const source = audioContext.createBufferSource();
      source.buffer = synthesize(sound, audioContext);
      source.connect(audioContext.destination);
      source.onended = () => finish();
      playback.stop = () => source.stop();
      source.start();
    }
  } catch {
    finish('Audio could not play. Try again.');
  }
}

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(option => option.setAttribute('aria-pressed', option === button));
    renderTiles();
  });
});
document.querySelectorAll('[data-word]').forEach(button => {
  button.addEventListener('click', () => play(sounds.find(sound => sound.symbol === button.dataset.sound), button.dataset.word));
});
$('#play').addEventListener('click', () => play(selected));
$('#example').addEventListener('click', () => play(selected, selected.word));
document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
  if (event.code === 'Space' && !event.target.closest('button, a, input, textarea, select, [contenteditable]')) {
    event.preventDefault();
    play(selected);
    return;
  }
  const sound = sounds.find(({key}) => key === event.key.toLowerCase());
  if (sound) play(sound);
});
renderTiles();
select(selected);
