import { Vector2D } from './types';

// Utility functions shared between client and server

export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function magnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vector2D): Vector2D {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export function add(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function multiply(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVector(a: Vector2D, b: Vector2D, t: number): Vector2D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

// Check if two circles collide
export function circleCollision(
  pos1: Vector2D,
  radius1: number,
  pos2: Vector2D,
  radius2: number
): boolean {
  return distance(pos1, pos2) < radius1 + radius2;
}

// Generate random position within bounds
export function randomPosition(width: number, height: number, padding: number = 0): Vector2D {
  return {
    x: padding + Math.random() * (width - 2 * padding),
    y: padding + Math.random() * (height - 2 * padding),
  };
}

// Generate random color
export function randomColor(): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Orange
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
