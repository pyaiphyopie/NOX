import { useMemo, useState } from 'react';
import { CATEGORIES, EVENTS } from '../data/events';

export default function useFilteredEvents() {
  const [activeTag, setActiveTag] = useState('All');

  const filteredEvents = useMemo(() => {
    if (activeTag === 'All') return EVENTS;
    return EVENTS.filter((e) => e.category === activeTag);
  }, [activeTag]);

  return { activeTag, setActiveTag, filteredEvents, categories: CATEGORIES };
}
