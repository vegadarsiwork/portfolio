'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Scanlines from '@/components/Scanlines';
import CursorSprite from '@/components/CursorSprite';
import CursorTrail from '@/components/CursorTrail';
import ScrollRail from '@/components/ScrollRail';
import Moon from '@/components/Moon';
import FallingStars from '@/components/FallingStars';
import CommandBar from '@/components/CommandBar';
import ScrollTopRocket, { FIREWORKS_EVENT } from '@/components/ScrollTopRocket';
import Hero from '@/components/Hero';
import About from '@/components/About';
import SelectedWork from '@/components/SelectedWork';
import Stack from '@/components/Stack';
import SideQuests from '@/components/SideQuests';
import Hackathons from '@/components/Hackathons';
import Outro from '@/components/Outro';
import { useV2MotionSettings } from '@/lib/motion-settings';
import { getInterpolatedPreset } from '@/lib/time-presets';

type TimeMode = 'realtime' | 'simulated';
// The time of day every visit opens on: night, with the moon up over the city.
const DEFAULT_HOUR = 22;
const BASE_TICKRATE = 20;
const FULL_DAY_SECONDS = 20 * 60;

function normalizeHour(hour: number) {
  const mod = hour % 24;
  return mod < 0 ? mod + 24 : mod;
}

function getCommandSuggestions(input: string) {
  const raw = input.replace(/^\//, '');
  const trimmedEnd = raw.trimEnd();
  const hasTrailingSpace = raw.endsWith(' ');
  const parts = trimmedEnd ? trimmedEnd.split(/\s+/) : [];

  if (parts.length === 0) {
    return ['help', 'tickrate fast', 'tickrate normal', 'time set sunset', 'time pause', 'crt on', 'fireworks'];
  }

  const rootCommands = ['help', 'tickrate', 'time', 'crt', 'fireworks'];
  if (parts.length === 1 && !hasTrailingSpace) {
    return rootCommands
      .filter((cmd) => cmd.startsWith(parts[0].toLowerCase()))
      .map((cmd) => `${cmd}${cmd === 'help' ? '' : ' '}`);
  }

  if (parts[0]?.toLowerCase() === 'tickrate') {
    const current = hasTrailingSpace ? '' : (parts[1] ?? '').toLowerCase();
    const options = ['fast', 'normal'];
    return options
      .filter((option) => option.startsWith(current))
      .map((option) => `tickrate ${option}`);
  }

  if (parts[0]?.toLowerCase() === 'crt') {
    const current = hasTrailingSpace ? '' : (parts[1] ?? '').toLowerCase();
    return ['on', 'off'].filter((option) => option.startsWith(current)).map((option) => `crt ${option}`);
  }

  if (parts[0]?.toLowerCase() === 'time') {
    if (parts.length === 1 && hasTrailingSpace) {
      return ['time set ', 'time pause', 'time resume', 'time realtime'];
    }
    if (parts.length === 2 && !hasTrailingSpace) {
      return ['set', 'pause', 'resume', 'realtime']
        .filter((item) => item.startsWith(parts[1].toLowerCase()))
        .map((option) => `time ${option}${option === 'set' ? ' ' : ''}`);
    }
    if (parts[1]?.toLowerCase() === 'set') {
      const current = hasTrailingSpace ? '' : (parts[2] ?? '').toLowerCase();
      return ['sunrise', 'day', 'noon', 'sunset', 'night', 'midnight']
        .filter((item) => item.startsWith(current))
        .map((option) => `time set ${option}`);
    }
  }

  return [];
}

export default function Home() {
  const [hour, setHour] = useState<number>(DEFAULT_HOUR);
  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [timeMode, setTimeMode] = useState<TimeMode>('realtime');
  const [tickRate, setTickRate] = useState<number>(1);
  const [commandOpen, setCommandOpen] = useState<boolean>(false);
  const [commandValue, setCommandValue] = useState<string>('');
  const [commandFeedback, setCommandFeedback] = useState<string>('Type /help');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);
  // Scanlines, glow and the cursor sprite, off by default. Toggled with /crt on|off.
  const [crt, setCrt] = useState<boolean>(false);
  const hourRef = useRef(hour);
  const motionSettings = useV2MotionSettings();

  const commandSuggestions = useMemo(
    () => (commandOpen ? getCommandSuggestions(commandValue).slice(0, 6) : []),
    [commandOpen, commandValue]
  );

  useEffect(() => {
    const id = window.setTimeout(() => setSelectedSuggestion(0), 0);
    return () => window.clearTimeout(id);
  }, [commandValue, commandOpen]);

  useEffect(() => {
    hourRef.current = hour;
  }, [hour]);

  // First-mount initialization. The page opens at DEFAULT_HOUR and stays there;
  // the clock only starts following real time if the visitor asks for it (the
  // AUTO button or /time realtime). Wrapped in setTimeout(0) so the state
  // update happens in a callback (satisfying React 19's set-state-in-effect rule).
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  // Time progression: real clock by default, simulated when changed by commands.
  useEffect(() => {
    if (!autoMode || !mounted) return;
    if (timeMode === 'realtime') {
      const tick = () => {
        const now = new Date();
        setHour(now.getHours() + now.getMinutes() / 60);
      };
      tick();
      const id = window.setInterval(tick, 30_000);
      return () => window.clearInterval(id);
    }

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const deltaSeconds = (now - last) / 1000;
      last = now;
      const hoursPerSecond = (24 / FULL_DAY_SECONDS) * (tickRate / BASE_TICKRATE);
      setHour((prev) => normalizeHour(prev + deltaSeconds * hoursPerSecond));
      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(raf);
  }, [autoMode, mounted, tickRate, timeMode]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (e.key === '/' && !isEditable) {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      if (e.key === 'Escape' && commandOpen) {
        e.preventDefault();
        setCommandOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commandOpen]);

  const handleHourChange = (h: number) => {
    if (autoMode) setAutoMode(false);
    setHour(normalizeHour(h));
  };

  const handleAutoToggle = () => {
    setAutoMode((prev) => {
      const next = !prev;
      if (next) {
        if (timeMode === 'realtime') {
          const now = new Date();
          setHour(now.getHours() + now.getMinutes() / 60);
        }
      }
      return next;
    });
  };

  const executeCommandValue = (input: string) => {
    const raw = input.trim().replace(/^\//, '');
    if (!raw) {
      setCommandOpen(false);
      return;
    }

    const parts = raw.split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (command === 'help') {
      setCommandFeedback('Commands: /tickrate <n|fast|normal>, /time set <day|night|sunrise|sunset|hour>, /time pause, /time resume, /time realtime, /crt <on|off>, /fireworks');
      setCommandValue('');
      return;
    }

    if (command === 'tickrate') {
      const rawRate = args[0]?.toLowerCase();
      const nextRate = rawRate === 'fast' || rawRate === 'normal' ? 20 : Number(args[0]);
      if (!Number.isFinite(nextRate) || nextRate <= 0) {
        setCommandFeedback('Usage: /tickrate <positive number|fast|normal>');
        return;
      }
      setTickRate(nextRate);
      setTimeMode('simulated');
      setAutoMode(true);
      setCommandFeedback(
        rawRate === 'fast' || rawRate === 'normal'
          ? 'Tickrate set to 20x'
          : `Tickrate set to ${nextRate}x`
      );
      setCommandValue('');
      return;
    }

    if (command === 'fireworks') {
      window.dispatchEvent(new Event(FIREWORKS_EVENT));
      setCommandFeedback('Fireworks!');
      setCommandValue('');
      setCommandOpen(false);
      return;
    }

    if (command === 'crt') {
      const value = args[0]?.toLowerCase();
      if (value !== 'on' && value !== 'off') {
        setCommandFeedback('Usage: /crt <on|off>');
        return;
      }
      setCrt(value === 'on');
      setCommandFeedback(value === 'on' ? 'CRT on - scanlines, glow and cursor sprite' : 'CRT off');
      setCommandValue('');
      return;
    }

    if (command === 'time') {
      const subcommand = args[0]?.toLowerCase();
      if (subcommand === 'pause') {
        setAutoMode(false);
        setCommandFeedback('Time paused');
        setCommandValue('');
        return;
      }
      if (subcommand === 'resume') {
        setAutoMode(true);
        setCommandFeedback(timeMode === 'realtime' ? 'Realtime resumed' : `Simulated time resumed at ${tickRate}x`);
        setCommandValue('');
        return;
      }
      if (subcommand === 'realtime') {
        const now = new Date();
        setTimeMode('realtime');
        setTickRate(1);
        setAutoMode(true);
        setHour(now.getHours() + now.getMinutes() / 60);
        setCommandFeedback('Returned to realtime clock');
        setCommandValue('');
        return;
      }
      if (subcommand === 'set') {
        const value = args[1]?.toLowerCase();
        const presets: Record<string, number> = {
          sunrise: 6,
          day: 9,
          noon: 12,
          sunset: 18.25,
          night: 22,
          midnight: 0,
        };
        const numeric = Number(value);
        const nextHour = value in presets ? presets[value] : numeric;
        if (!Number.isFinite(nextHour)) {
          setCommandFeedback('Usage: /time set <day|night|sunrise|sunset|hour>');
          return;
        }
        setHour(normalizeHour(nextHour));
        setCommandFeedback(`Time set to ${value ?? normalizeHour(nextHour).toFixed(2)}`);
        setCommandValue('');
        return;
      }
    }

    setCommandFeedback(`Unknown command: /${raw}`);
  };

  const executeCommand = () => {
    executeCommandValue(commandValue);
  };

  // Derived — interpolated preset based on continuous hour
  const preset = useMemo(() => getInterpolatedPreset(hour), [hour]);

  const wrapperStyle: CSSProperties = {
    backgroundColor: 'var(--color-v2-bg)',
    color: 'var(--color-v2-text)',
    fontFamily: 'var(--font-family-body-v2)',
    ['--color-v2-orange' as string]: preset.accentColor,
  };

  // The sections take no props, so one stable element tree keeps them from
  // re-rendering every time the clock ticks.
  const sections = useMemo(
    () => (
      <>
        <About />
        <SelectedWork />
        <Stack />
        <SideQuests />
        <Hackathons />
        <Outro />
      </>
    ),
    []
  );

  return (
    <div className={`relative min-h-screen overflow-x-clip${crt ? ' crt' : ''}`} style={wrapperStyle}>
      {crt && <Scanlines opacity={motionSettings.reduceMotion ? 0.02 : 0.06} />}
      <CursorSprite enabled={crt && motionSettings.enableCursorSprite} />
      <CursorTrail enabled={!crt && motionSettings.enableCursorSprite} />
      <ScrollRail />
      <FallingStars />
      <Moon hour={hour} />
      <ScrollTopRocket />
      <CommandBar
        open={commandOpen}
        value={commandValue}
        feedback={commandFeedback}
        suggestions={commandSuggestions}
        selectedSuggestion={selectedSuggestion}
        onChange={setCommandValue}
        onAutocomplete={() => {
          const completion = commandSuggestions[selectedSuggestion];
          if (completion) setCommandValue(completion);
        }}
        onSelectSuggestion={(suggestion) => {
          setCommandValue(suggestion);
        }}
        onMoveSelection={(direction) => {
          if (!commandSuggestions.length) return;
          setSelectedSuggestion((prev) => (prev + direction + commandSuggestions.length) % commandSuggestions.length);
        }}
        onSubmit={() => {
          const selected = commandSuggestions[selectedSuggestion];
          if (selected) {
            setCommandValue(selected);
            executeCommandValue(selected);
            return;
          }
          executeCommand();
        }}
        onClose={() => setCommandOpen(false)}
      />

      {/* Touch trigger — the command bar is otherwise keyboard-only ('/'), so
          surface an on-screen opener for coarse-pointer devices. */}
      {motionSettings.coarsePointer && !commandOpen && (
        <button
          type="button"
          aria-label="Open command bar"
          onClick={() => setCommandOpen(true)}
          className="pxl fixed left-4 z-[110] flex h-11 w-11 items-center justify-center border border-[var(--color-v2-muted)]/40 bg-[var(--color-v2-bg)] text-[var(--color-v2-orange)] pointer-events-auto"
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          /
        </button>
      )}

      <main className="relative z-10">
        <Hero
          hour={hour}
          onHourChange={handleHourChange}
          autoMode={autoMode}
          onAutoToggle={handleAutoToggle}
          mounted={mounted}
          motionSettings={motionSettings}
        />
        {sections}
      </main>
    </div>
  );
}
