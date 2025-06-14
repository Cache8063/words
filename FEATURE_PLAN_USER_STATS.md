# User Statistics Tracking

## Overview
Implement comprehensive user statistics tracking to enable personal stats viewing and social features.

## Requirements
- [ ] Design database schema for user statistics
- [ ] Track games played, won, lost
- [ ] Track guess distribution (wins in 1, 2, 3, 4, 5, 6 attempts)
- [ ] Track current/max streaks
- [ ] Track average game completion time
- [ ] Track words played to avoid repeats
- [ ] API endpoints for stats retrieval

## Data Model
```javascript
UserStats {
  userId: string (ATProto DID),
  gamesPlayed: number,
  gamesWon: number,
  currentStreak: number,
  maxStreak: number,
  guessDistribution: {
    1: number,
    2: number,
    3: number,
    4: number,
    5: number,
    6: number
  },
  averageGuesses: number,
  averageTime: number (seconds),
  lastPlayed: Date,
  wordsPlayed: string[] (or separate table)
}
```

## Technical Approach
1. Backend:
   - Add stats recording to game completion
   - Create `/api/stats/:userId` endpoint
   - Add database (SQLite for simple, PostgreSQL for scale)
   - Migration scripts

2. Frontend:
   - Stats display component
   - Visual charts for guess distribution
   - Streak counter display

## Dependencies
- Database driver (sqlite3 or pg)
- Migration tool (knex or similar)

## Testing
- Test stat calculations
- Test streak tracking
- Test API endpoints
- Test data persistence