# IPAmouth

An interactive speech sound lab. Choose an IPA symbol to hear a synthesized sound and see its articulation in a schematic side view. Use the letter on a tile to play its sound, or press Space to replay the selected sound when focus is outside a control.

## Run locally

From the existing IPAmouth checkout, start the static server:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. The app needs no package installation, account, microphone, or external requests. Playback begins after a click or keypress.

The Compare section uses minimal pairs, aspiration, and sound distribution from *Intro to Linguistics*, Class 04 (Phonology), with Class 02 (Language) informing its descriptive approach to pronunciation variation. The library covers a selection of sounds rather than the full IPA. Standalone sounds are Web Audio approximations. Word examples are bundled audio generated with FFmpeg’s Flite speech synthesizer using its SLT voice.
