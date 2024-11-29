// Task interface representing a unit of work with its data and a callback to send the response
export interface Task<T> {
    data: T; // The input data for the task
    sendResponse: (response: any) => void; // Callback function to send the result back
}

/**
 * Generic TaskQueue class to manage asynchronous processing of tasks in order
 * The queue ensures that tasks are processed one at a time, maintaining order and preventing concurrency issues
 * This is especially important when interacting with resources that cannot handle concurrent requests, such as certain AI models
 */
export class TaskQueue<T> {
    private queue: Task<T>[] = []; // Queue to store tasks waiting to be processed
    private busy: boolean = false; // Flag to indicate if a task is currently being processed
    private processTask: (task: Task<T>) => Promise<void>; // Function to process a single task

    // Constructor accepts a function that defines how to process a task
    constructor(processTask: (task: Task<T>) => Promise<void>) {
        this.processTask = processTask; // Assign the task processing function
    }

    // Enqueue a new task and start processing if not already in progress
    enqueue(data: T, sendResponse: (response: any) => void) {
        this.queue.push({ data, sendResponse }); // Add the new task to the queue
        this.processQueue();  // Attempt to process tasks in the queue
    }

    // Internal method to process tasks one at a time in FIFO (First-In-First-Out) order
    private async processQueue() {
        if (this.busy || this.queue.length === 0) { // If already processing a task or if the queue is empty, do nothing
            return;
        }
        this.busy = true; // Set the busy flag to indicate a task is being processed
        const task = this.queue.shift() as Task<T>; // Remove the next task from the queue (FIFO order)

        try {
            await this.processTask(task); // Process the task using the provided processTask function
        } finally {
            this.busy = false; // After processing, reset the busy flag
            this.processQueue(); // Continue processing the next task in the queue, if any
        }
    }
}
