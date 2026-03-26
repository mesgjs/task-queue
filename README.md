# TaskQueue

A minimalist async task queue/serializer for JavaScript.

## Overview

TaskQueue ensures async operations execute in FIFO (first-in, first-out) order, preventing race conditions when multiple async tasks need to be serialized.

## Installation

Use directly as an ES module via jsdelivr:

```javascript
import { TaskQueue } from 'https://cdn.jsdelivr.net/gh/mesgjs/task-queue/src/task-queue.esm.js';
```

## Usage

```javascript
import { TaskQueue } from 'https://cdn.jsdelivr.net/gh/mesgjs/task-queue/src/task-queue.esm.js';

const queue = new TaskQueue();

// Queue async tasks
const result1 = await queue.add(async () => {
  // Your async operation
  return 'result';
});

const result2 = await queue.add(async () => {
  // This runs after result1 completes
  return 'another result';
});
```

## API

### `new TaskQueue()`

Creates a new task queue instance.

### `add(callback)` (alias `task`)

Queues an async function for execution.

- **Parameters**: `callback` - Async function to execute
- **Returns**: Promise that resolves with the callback's return value
- **Throws**: Rejects if the queue is shutting down

### `cancel(callback, { resolve, reject })`

Cancels a queued task. By default, promises reject with `Cancelled`.

- **Parameters**:
  - `callback` - The callback function to cancel
  - `resolve` - The promise will resolve to this if not `undefined`
  - `reject` - The promise will reject with this if not `undefined`
- **Returns**: `true` if cancelled, `false` if not found

### `shutdown()`

Shuts down the queue and rejects all pending operations with `Shutting down`.

### `size`

Returns the number of pending operations in the queue.

## License

See [LICENSE](LICENSE) file for details.

## Copyright

Copyright 2025-2026 Kappa Computer Solutions, LLC and Brian Katzung
