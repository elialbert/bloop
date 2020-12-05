import * as Tone from 'tone'
import Tonal from 'tonal'
import soundBridge from './soundBridge.js'

var startTransport = function () {
  if (Tone.context.state !== 'running') {
    Tone.context.resume();
  }
  Tone.Transport.start()
}

var stopTransport = function () {
  Tone.Transport.cancel(0)
  Tone.Transport.stop()
}

var changePitch = function (cur, direction, pitchKey) {
  let notes = Tonal.scale(pitchKey.toLowerCase())
  let note = Tonal.note.pc(cur)
  let octave = Tonal.note.oct(cur) || 3
  let index = notes.indexOf(note) + direction

  if (index < 0 && octave > 1) {
    octave = 1
    index = notes.length - 1
  } else if (index >= notes.length && octave < 5) {
    octave += 1
    index = 0
  }
  let attempt = notes[index] + octave
  return attempt || cur
}

var tripletTime = new Tone.Time('32t').toSeconds()
var doubledTripletTime = tripletTime + tripletTime

var landingDataFunc = function (vm, animateFunc, defs, endcb, songIndex) {
  return function (time, col) {
    for (var i = 0; i < vm.defsLength; i++) {
      var square = (vm.dataArray[i] || {})[col]
      if (!square || !square.triplet) {
        continue
      }
      let idef = vm.idefLookup[i]
      let qTime = time
      if (square.measureSub) {
        qTime = Tone.Time(time).quantize(square.measureSub).toSeconds()
      }
      let triplet = square.triplet
      if ((triplet[0] || {}).state > 0) {
        let fpitch = (square.triplet[0] || {}).pitch || square.pitch
        soundBridge.startBeat(idef.iindex, fpitch, qTime, i, square.e1)
      }

      let rand = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][Math.floor(Math.random() * 10)]

      if ((triplet[1] || {}).state > 7 && rand > 6) {
        soundBridge.startBeat(idef.iindex, (square.triplet[1] || {}).pitch || square.pitch, qTime + tripletTime, i, square.e1)
      }
      if ((triplet[2] || {}).state > 7 && rand > 6) {
        soundBridge.startBeat(idef.iindex, (square.triplet[2] || {}).pitch || square.pitch, qTime + doubledTripletTime, i, square.e1)
      }
    }
    Tone.Draw.schedule(function () {
      animateFunc(col, !endcb, songIndex)
    }, time)

    if (endcb && col === (getLength(vm.dataArray[0]) - 1)) {
      endcb(songIndex)
    }
  }
}

var getLength = function (obj) {
  return obj.length || Object.keys(obj).length
}

var makeLoop = function (dataFunc, numCols) {
  var la = []
  for (var i = 0; i < numCols; i++) {
    la.push(i)
  }

  // so weird that this is necessary
  const bell = new Tone.MetalSynth({
    volume: -100
  }).toDestination();

  const bellPart = new Tone.Sequence(((time, freq) => {
    bell.triggerAttack(freq, time, Math.random()*0.5 + 0.5);
    dataFunc(time, freq)
  }), la, '16n')
  return bellPart
}

export default {
  makeLoop: makeLoop,
  landingDataFunc,
  startTransport: startTransport,
  changePitch: changePitch,
  stopTransport: stopTransport
}
