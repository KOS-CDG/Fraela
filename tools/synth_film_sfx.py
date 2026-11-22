import sys, wave
import numpy as np

# Small sound effects for the 2026 film, synthesised from scratch: heartbeat,
# phone buzz, a screen tap, a flip-clock clack, a rubber stamp and a pen
# scribble. Deterministic (seeded), so a rerun writes the same files.
#
#   python3 tools/synth_film_sfx.py video/src/audio
#
# It also writes typing.wav, which the film does not use.
SR = 48000
out = sys.argv[1]
rng = np.random.default_rng(22)

def t(dur):
    return np.arange(int(dur * SR)) / SR

def env(n, attack, tau):
    tt = np.arange(n) / SR
    a = np.clip(tt / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(tt - attack, 0) / tau)

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y

def hp(x, fc):
    return x - onepole_lp(x, fc)

def bandpass(x, lo, hi):
    return onepole_lp(hp(x, lo), hi)

def resonator(x, f, q):
    # two-pole resonant filter
    w = 2 * np.pi * f / SR
    r = np.exp(-w / (2 * q))
    b1, b2 = 2 * r * np.cos(w), -r * r
    y = np.zeros_like(x)
    y1 = y2 = 0.0
    for i, v in enumerate(x):
        y0 = v + b1 * y1 + b2 * y2
        y[i] = y0
        y2, y1 = y1, y0
    return y * (1 - r)

def sweep(dur, f0, f1, tau):
    tt = t(dur)
    f = f1 + (f0 - f1) * np.exp(-tt / tau)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def place(buf, x, at):
    i = int(at * SR)
    buf[i:i + len(x)] += x[:max(0, len(buf) - i)]

def save(name, x, peak_db=-3.0):
    x = x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)
    # 10 ms fade-out so nothing clicks at the end
    n = int(0.01 * SR)
    x[-n:] *= np.linspace(1, 0, n)
    data = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    with wave.open(f'{out}/{name}.wav', 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(name, f'{len(x)/SR:.2f}s')

# Heartbeat: "lub" then a softer, higher "dub". Low sine thumps for weight, saturated so
# their harmonics (100-300 Hz) still read on phone speakers, plus a soft knock transient.
def thump(f0, f1, amp, tau):
    n = int(0.45 * SR)
    body = sweep(0.45, f0, f1, 0.05) * env(n, 0.004, tau)
    knock = onepole_lp(rng.standard_normal(n), 900) * env(n, 0.001, 0.012) * 0.6
    mid = resonator(rng.standard_normal(n) * env(n, 0.002, 0.03), 140, 4) * 6
    return amp * np.tanh(2.2 * (body + knock + mid))
hb = np.zeros(int(0.85 * SR))
place(hb, thump(78, 44, 1.0, 0.075), 0.0)
place(hb, thump(92, 52, 0.72, 0.06), 0.27)
save('heartbeat', hb, -2.0)

# Phone buzz: two pulses of a ~185 Hz vibration motor with a little table rattle.
def buzz(dur):
    tt = t(dur)
    f = 185 + 4 * np.sin(2 * np.pi * 7 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR
    motor = np.sign(np.sin(ph)) * 0.5 + np.sin(ph) * 0.5 + 0.3 * np.sin(2 * ph)
    motor = onepole_lp(motor, 2500)
    rattle = hp(rng.standard_normal(len(tt)), 1800) * (np.sin(ph) > 0.7) * 0.25
    shape = np.clip(tt / 0.02, 0, 1) * np.clip((dur - tt) / 0.03, 0, 1)
    return (motor + rattle) * shape
bz = np.zeros(int(1.0 * SR))
place(bz, buzz(0.32), 0.0)
place(bz, buzz(0.32), 0.47)
save('phone-buzz', bz, -4.0)

# Typing: 24 soft screen taps, one every 100 ms (3 frames at 30 fps), slightly varied.
def tap(gain, pitch):
    n = int(0.05 * SR)
    click = onepole_lp(onepole_lp(hp(rng.standard_normal(n), 900), 3500), 3500) * env(n, 0.0005, 0.004)
    ping = resonator(rng.standard_normal(n) * env(n, 0.0005, 0.002), pitch, 12) * 4
    thud = onepole_lp(rng.standard_normal(n), 400) * env(n, 0.001, 0.008) * 0.8
    return gain * (click + ping + thud)
save('tap', tap(1.0, 2300), -6.0)
ty = np.zeros(int(2.5 * SR))
for i in range(24):
    place(ty, tap(rng.uniform(0.6, 1.0), rng.uniform(2000, 2700)), i * 0.1 + rng.uniform(-0.006, 0.006))
save('typing', ty, -6.0)

# Flip clock: the card snaps over (bright clack) and lands (a smaller knock).
def clack(gain, lo, hi, tau):
    n = int(0.08 * SR)
    return gain * bandpass(rng.standard_normal(n), lo, hi) * env(n, 0.0005, tau)
fl = np.zeros(int(0.35 * SR))
place(fl, onepole_lp(clack(1.0, 1200, 5000, 0.008), 5000), 0.0)
place(fl, resonator(rng.standard_normal(int(0.08 * SR)) * env(int(0.08 * SR), 0.0005, 0.01), 420, 6) * 2, 0.0)
place(fl, clack(0.55, 900, 4000, 0.012), 0.045)
save('flip', fl, -3.0)

# Rubber stamp: low thump with a slap of paper and a woody knock.
n = int(0.4 * SR)
stamp = sweep(0.4, 120, 70, 0.03) * env(n, 0.002, 0.06)
stamp += onepole_lp(rng.standard_normal(n), 2200) * env(n, 0.001, 0.02) * 0.9
stamp += resonator(rng.standard_normal(n) * env(n, 0.001, 0.02), 230, 5) * 6
save('stamp', np.tanh(1.8 * stamp), -3.0)

# Pen scribble: bursts of bright friction noise, one per pen stroke.
pen = np.zeros(int(1.6 * SR))
at = 0.0
while at < 1.45:
    d = rng.uniform(0.08, 0.2)
    m = int(d * SR)
    tt = np.arange(m) / m
    stroke = onepole_lp(bandpass(rng.standard_normal(m), 1500, 4000), 4000) * np.sin(np.pi * tt) ** 0.7
    stroke *= 1 + 0.5 * np.sin(2 * np.pi * rng.uniform(15, 30) * tt * d)
    place(pen, stroke * rng.uniform(0.5, 1.0), at)
    at += d + rng.uniform(0.02, 0.07)
save('pen', pen, -9.0)
