import { describe, it, expect } from 'vitest';
import {
  EVENTS,
  CATEGORIES,
  VENUES,
  DASHBOARD_METRICS,
  PROMOTER_WORKFLOW,
} from './events';

describe('events data module', () => {
  describe('EVENTS', () => {
    it('exports an array of 5 events', () => {
      expect(EVENTS).toHaveLength(5);
    });

    it('each event has required fields', () => {
      const requiredFields = [
        'id',
        'title',
        'venue',
        'genre',
        'category',
        'time',
        'date',
        'price',
        'currency',
        'attendance',
        'capacity',
        'image',
        'description',
        'lineup',
        'tags',
      ];
      EVENTS.forEach((event) => {
        requiredFields.forEach((field) => {
          expect(event).toHaveProperty(field);
        });
      });
    });

    it('each event has a unique id', () => {
      const ids = EVENTS.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('each event has numeric price and capacity', () => {
      EVENTS.forEach((event) => {
        expect(typeof event.price).toBe('number');
        expect(typeof event.capacity).toBe('number');
        expect(typeof event.attendance).toBe('number');
      });
    });

    it('each event has a non-empty lineup array', () => {
      EVENTS.forEach((event) => {
        expect(Array.isArray(event.lineup)).toBe(true);
        expect(event.lineup.length).toBeGreaterThan(0);
      });
    });

    it('each event has a non-empty tags array', () => {
      EVENTS.forEach((event) => {
        expect(Array.isArray(event.tags)).toBe(true);
        expect(event.tags.length).toBeGreaterThan(0);
      });
    });

    it('attendance does not exceed capacity', () => {
      EVENTS.forEach((event) => {
        expect(event.attendance).toBeLessThanOrEqual(event.capacity);
      });
    });
  });

  describe('CATEGORIES', () => {
    it('exports an array with All and genre categories', () => {
      expect(CATEGORIES).toContain('All');
      expect(CATEGORIES).toContain('Techno');
      expect(CATEGORIES).toContain('Hip-Hop');
      expect(CATEGORIES).toContain('EDM');
      expect(CATEGORIES).toContain('Live Bands');
      expect(CATEGORIES).toContain('Rooftop');
    });

    it('each event category is represented in CATEGORIES', () => {
      EVENTS.forEach((event) => {
        expect(CATEGORIES).toContain(event.category);
      });
    });
  });

  describe('VENUES', () => {
    it('exports an array of 5 venues', () => {
      expect(VENUES).toHaveLength(5);
    });

    it('each venue has required fields', () => {
      VENUES.forEach((venue) => {
        expect(venue).toHaveProperty('name');
        expect(venue).toHaveProperty('type');
        expect(venue).toHaveProperty('capacity');
        expect(venue).toHaveProperty('location');
        expect(venue).toHaveProperty('rating');
      });
    });

    it('each venue has a numeric rating between 0 and 5', () => {
      VENUES.forEach((venue) => {
        expect(typeof venue.rating).toBe('number');
        expect(venue.rating).toBeGreaterThanOrEqual(0);
        expect(venue.rating).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('DASHBOARD_METRICS', () => {
    it('has all expected metric keys', () => {
      expect(DASHBOARD_METRICS).toHaveProperty('ticketsSold');
      expect(DASHBOARD_METRICS).toHaveProperty('revenue');
      expect(DASHBOARD_METRICS).toHaveProperty('attendanceRate');
      expect(DASHBOARD_METRICS).toHaveProperty('checkIns');
    });

    it('all metric values are numbers', () => {
      Object.values(DASHBOARD_METRICS).forEach((val) => {
        expect(typeof val).toBe('number');
      });
    });
  });

  describe('PROMOTER_WORKFLOW', () => {
    it('exports 4 workflow steps', () => {
      expect(PROMOTER_WORKFLOW).toHaveLength(4);
    });

    it('each step has step and description fields', () => {
      PROMOTER_WORKFLOW.forEach((item) => {
        expect(typeof item.step).toBe('string');
        expect(typeof item.description).toBe('string');
        expect(item.step.length).toBeGreaterThan(0);
        expect(item.description.length).toBeGreaterThan(0);
      });
    });
  });
});
