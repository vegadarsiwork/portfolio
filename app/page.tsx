'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Starfield from '@/components/Starfield';
import Scanlines from '@/components/Scanlines';
import CursorSprite from '@/components/CursorSprite';
import CommandBar from '@/components/CommandBar';
import ScrollTopRocket from '@/components/ScrollTopRocket';
import Hero from '@/components/Hero';
import Origin from '@/components/Origin';
import Experience from '@/components/Experience';
import SelectedWork from '@/components/SelectedWork';
import Stack from '@/components/Stack';
import SideQuests from '@/components/SideQuests';
import Hackathons from '@/components/Hackathons';
import Now from '@/components/Now';
import Outro from '@/components/Outro';
import { useV2MotionSettings } from '@/lib/motion-settings';
import { getInterpolatedPreset } from '@/lib/time-presets';

type TimeMode = 'realtime' | 'simulated';
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
    return ['help', 'tickrate fast', 'tickrate normal', 'time set sunset', 'time pause'];
  }

  const rootCommands = ['help', 'tickrate', 'time'];
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
  const [hour, setHour] = useState<number>(18);
  const [autoMode, setAutoMode] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  const [timeMode, setTimeMode] = useState<TimeMode>('realtime');
  const [tickRate, setTickRate] = useState<number>(1);
  const [commandOpen, setCommandOpen] = useState<boolean>(false);
  const [commandValue, setCommandValue] = useState<string>('');
  const [commandFeedback, setCommandFeedback] = useState<string>('Type /help');
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0);
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

  // First-mount initialization: sync wall clock + reveal canvas.
  // Wrapped in setTimeout(0) so the state updates happen in a callback
  // (satisfying React 19's set-state-in-effect rule).
  useEffect(() => {
    const id = window.setTimeout(() => {
      const now = new Date();
      setHour(now.getHours() + now.getMinutes() / 60);
      setMounted(true);
    }, 0);
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
      setCommandFeedback('Commands: /tickrate <n|fast|normal>, /time set <day|night|sunrise|sunset|hour>, /time pause, /time resume, /time realtime');
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

  return (
    <div className="relative min-h-screen overflow-x-clip" style={wrapperStyle}>
      {/* Atmosphere — fixed across the viewport, always visible */}
      <Starfield
        density={motionSettings.starDensity}
        tickRate={motionSettings.reduceMotion ? 0.35 : tickRate}
      />
      <Scanlines opacity={motionSettings.scanlineOpacity} />
      <CursorSprite enabled={motionSettings.enableCursorSprite} />
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

      <main className="relative z-10">
        <Hero
          hour={hour}
          onHourChange={handleHourChange}
          autoMode={autoMode}
          onAutoToggle={handleAutoToggle}
          presetLabel={preset.label}
          mounted={mounted}
          motionSettings={motionSettings}
        />
        <Origin />
        <Experience />
        <SelectedWork />
        <Stack />
        <SideQuests />
        <Hackathons />
        <Now />
        <Outro />
      </main>
    </div>
  );
}
