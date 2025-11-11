import { MouseEventType, StoredAnswer } from '../../store/types';

export interface AIDetectionResults {
    flagged: boolean;
    flaggedEvents: FlaggedEvent[];
}

export interface FlaggedEvent {
    type: 'fastMouseMoveInClick' | 'fastMouseMove' | 'scrollSpeed' | 'typeSpeed' | 'copy' | 'paste' | 'typeRegularity';
    time: number | [number, number];
    details?: Record<string, any>;
}

function calcMouseMove(e1: MouseEventType, e2: MouseEventType) {
  const deltaT = e2[0] - e1[0];
  const deltaX = Math.abs(e2[2][0] - e1[2][0]);
  const deltaY = Math.abs(e2[2][1] - e1[2][1]);
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  return {
    deltaT, deltaX, deltaY, distance,
  };
}

function mouseMove(answer: StoredAnswer): FlaggedEvent[] {
  const flaggedEvents: FlaggedEvent[] = [];
  const mouseEvents = answer.windowEvents
    .filter((event) => ['mousedown', 'mouseup'].includes(event[1]));

  // check if mouse down and up occur very close to each other and different places
  let mouseDown = null;
  for (const mouseEvent of mouseEvents) {
    if (mouseEvent[1] === 'mousedown') {
      mouseDown = mouseEvent;
    }
    if (mouseEvent !== undefined && mouseEvent[1] === 'mouseup' && mouseDown) {
      const { distance, deltaT } = calcMouseMove(mouseDown, mouseEvent);
      if (deltaT < 25 && distance > 50) {
        flaggedEvents.push({
          type: 'fastMouseMoveInClick',
          time: [mouseDown[0], mouseEvent[0]],
        });
      }
      mouseDown = null;
    }
  }

  // check for fast mouse move event
  const mouseMoveEvents = answer.windowEvents
    .filter((event) => ['mousemove'].includes(event[1])) as MouseEventType[];

  // check if mouse moves too fast
  for (let i = 1; i < mouseEvents.length; i++) {
    const lastEvent = mouseMoveEvents[i - 1];
    const event = mouseMoveEvents[i];
    if (lastEvent && event) {
      const { distance, deltaT } = calcMouseMove(lastEvent, event);
      if (deltaT < 25 && distance > 50) {
        flaggedEvents.push({
          type: 'fastMouseMove',
          time: [lastEvent[0], event[0]],
        });
      }
    }
  }

  return flaggedEvents;
}

function copyPaste(answer: StoredAnswer): FlaggedEvent[] {
  const flaggedEvents: FlaggedEvent[] = [];
  const copyPasteEvents = answer.windowEvents
    .filter((event) => ['copy', 'paste'].includes(event[1]))
    .filter((event) => event[1] === 'copy' || event[1] === 'paste')
    .map((event) => ({
      time: event[0],
      type: event[1],
      details: {
        value: event[2],
      },
    }));

  return copyPasteEvents;
}

function scrollWheel(answer: StoredAnswer): FlaggedEvent[] {
  const flaggedEvents: FlaggedEvent[] = [];
  const scrollEvents = answer.windowEvents.filter((e) => e[1] === 'scroll');

  return flaggedEvents;
}

function typeSpeed(answer: StoredAnswer): FlaggedEvent[] {
  const flaggedEvents: FlaggedEvent[] = [];
  const typingEvents = answer.windowEvents.filter((e) => e[1] === 'keydown');

  for (let i = 0; i < typingEvents.length; i++) {
    if (i > 5 && typingEvents[i - 5][0] - typingEvents[i][0] < 200) {
      flaggedEvents.push({
        type: 'typeSpeed',
        time: typingEvents[i][0],
        details: {},
      });
    }

    if (i > 10) {
      let consistent = true;
      let timeBetween = -1;
      for (let j = 1; j < 10; j++) {
        if (timeBetween === -1) {
          timeBetween = typingEvents[i - j][0] - typingEvents[i][0];
        } else if (typingEvents[i - j][0] - typingEvents[i - j + 1][0] !== timeBetween) {
          consistent = false;
          break;
        }
      }
      if (consistent) {
        flaggedEvents.push({
          type: 'typeRegularity',
          time: typingEvents[i][0],
          details: {},
        });
      }
    }
  }

  return flaggedEvents;
}

export function runDetectionHeuristics(answer: StoredAnswer): AIDetectionResults {
  const flaggedEvents: FlaggedEvent[] = [];
  flaggedEvents.push(...mouseMove(answer));
  flaggedEvents.push(...copyPaste(answer));
  flaggedEvents.push(...scrollWheel(answer));
  flaggedEvents.push(...typeSpeed(answer));
  // maybe regularity?
  // TODO: should we sort by time at end?
  return { flagged: flaggedEvents.length > 0, flaggedEvents };
}
