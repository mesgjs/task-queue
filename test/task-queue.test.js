import { assertEquals, assertRejects, assert } from "jsr:@std/assert";
import { TaskQueue } from "../src/task-queue.esm.js";

Deno.test("TaskQueue - executes tasks in FIFO order", async () => {
  const queue = new TaskQueue();
  const results = [];
  
  const task1 = queue.add(async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    results.push(1);
    return "result1";
  });
  
  const task2 = queue.add(async () => {
    results.push(2);
    return "result2";
  });
  
  assertEquals(queue.size, 2);
  
  const r1 = await task1;
  const r2 = await task2;
  
  assertEquals(r1, "result1");
  assertEquals(r2, "result2");
  assertEquals(results, [1, 2]);
  assertEquals(queue.size, 0);
});

Deno.test("TaskQueue - handles task rejection", async () => {
  const queue = new TaskQueue();
  
  const task1 = queue.add(async () => {
    throw new Error("Task failed");
  });
  
  const task2 = queue.add(async () => {
    return "success";
  });
  
  await assertRejects(() => task1, Error, "Task failed");
  const r2 = await task2;
  assertEquals(r2, "success");
});

Deno.test("TaskQueue - cancel pending task", async () => {
  const queue = new TaskQueue();
  
  const cb1 = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return 1;
  };
  
  const cb2 = async () => {
    return 2;
  };
  
  const task1 = queue.add(cb1);
  const task2 = queue.add(cb2);
  
  assertEquals(queue.size, 2);
  
  const cancelled = queue.cancel(cb2);
  assertEquals(cancelled, true);
  assertEquals(queue.size, 1);
  
  try {
    await task2;
    assert(false, "Should have rejected");
  } catch (e) {
    assertEquals(e, "Cancelled");
  }
  
  const r1 = await task1;
  assertEquals(r1, 1);
});

Deno.test("TaskQueue - cancel running task fails", async () => {
  const queue = new TaskQueue();
  
  const cb1 = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return 1;
  };
  
  const task1 = queue.add(cb1);
  
  // Wait for the microtask to start processing the queue
  await new Promise(resolve => queueMicrotask(resolve));
  
  const cancelled = queue.cancel(cb1);
  assertEquals(cancelled, false);
  
  const r1 = await task1;
  assertEquals(r1, 1);
});

Deno.test("TaskQueue - cancel with custom resolve", async () => {
  const queue = new TaskQueue();
  
  const cb1 = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return 1;
  };
  
  const cb2 = async () => {
    return 2;
  };
  
  const task1 = queue.add(cb1);
  const task2 = queue.add(cb2);
  
  const cancelled = queue.cancel(cb2, { resolve: "custom resolve" });
  assertEquals(cancelled, true);
  
  const r2 = await task2;
  assertEquals(r2, "custom resolve");
  
  await task1;
});

Deno.test("TaskQueue - cancel with custom reject", async () => {
  const queue = new TaskQueue();
  
  const cb1 = async () => {
    await new Promise(resolve => setTimeout(resolve, 10));
    return 1;
  };
  
  const cb2 = async () => {
    return 2;
  };
  
  const task1 = queue.add(cb1);
  const task2 = queue.add(cb2);
  
  const cancelled = queue.cancel(cb2, { reject: "custom reject" });
  assertEquals(cancelled, true);
  
  try {
    await task2;
    assert(false, "Should have rejected");
  } catch (e) {
    assertEquals(e, "custom reject");
  }
  
  await task1;
});

Deno.test("TaskQueue - shutdown rejects pending tasks", async () => {
  const queue = new TaskQueue();
  
  let task1Started = false;
  let resolveTask1;
  const task1Promise = new Promise(resolve => { resolveTask1 = resolve; });
  
  const task1 = queue.add(async () => {
    task1Started = true;
    await task1Promise;
    return 1;
  });
  
  // Wait for task1 to start running
  await new Promise(resolve => queueMicrotask(resolve));
  
  const task2 = queue.add(async () => {
    return 2;
  });
  
  queue.shutdown();
  
  try {
    await task2;
    assert(false, "Should have rejected");
  } catch (e) {
    assertEquals(e, "Shutting down");
  }
  
  // task1 is already running, but because it's still in the queue, shutdown rejects it too
  try {
    await task1;
    assert(false, "Should have rejected");
  } catch (e) {
    assertEquals(e, "Shutting down");
  }
  assertEquals(task1Started, true);
  
  // Adding new tasks after shutdown should reject
  try {
    await queue.add(async () => 3);
    assert(false, "Should have rejected");
  } catch (e) {
    assertEquals(e, "Shutting down");
  }
  
  // Resolve task1 to prevent leaks
  resolveTask1();
  // Wait a tick for the callback to finish
  await new Promise(resolve => setTimeout(resolve, 0));
});

Deno.test("TaskQueue - .task alias works", async () => {
  const queue = new TaskQueue();
  
  const task1 = queue.task(async () => {
    return "alias";
  });
  
  const r1 = await task1;
  assertEquals(r1, "alias");
});
