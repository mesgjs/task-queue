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
const result1 = await queue.task(async () => {
  // Your async operation
  return 'result';
});

const result2 = await queue.task(async () => {
  // This runs after result1 completes
  return 'another result';
});
```

## API

### `new TaskQueue()`

Creates a new task queue instance.

### `task(callback)`

Queues an async function for execution.

- **Parameters**: `callback` - Async function to execute
- **Returns**: Promise that resolves with the callback's return value
- **Throws**: Rejects if the queue is shutting down

### `cancel(callback)`

Cancels a queued task.

- **Parameters**: `callback` - The callback function to cancel
- **Returns**: `true` if cancelled, `false` if not found

### `shutdown()`

Shuts down the queue and rejects all pending operations.

### `size`

Returns the number of pending operations in the queue.

## License

See [LICENSE](LICENSE) file for details.

## Copyright

Copyright 2025 Kappa Computer Solutions, LLC and Brian Katzung
