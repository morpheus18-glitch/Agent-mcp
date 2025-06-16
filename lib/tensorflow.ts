import * as tf from "@tensorflow/tfjs";

// Initialize TensorFlow.js
export async function initTensorflow() {
  // Load the TensorFlow.js model
  await tf.ready();
  console.log("TensorFlow.js initialized");
  return tf;
}

// Simple model for agent orchestration
export async function createOrchestrationModel() {
  const model = tf.sequential();

  // Add layers
  model.add(
    tf.layers.dense({
      units: 64,
      activation: "relu",
      inputShape: [10],
    }),
  );

  model.add(
    tf.layers.dense({
      units: 32,
      activation: "relu",
    }),
  );

  model.add(
    tf.layers.dense({
      units: 5,
      activation: "softmax",
    }),
  );

  // Compile the model
  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

// Train the model with conversation data
export async function trainModel(
  model: tf.Sequential,
  data: unknown[],
  labels: unknown[],
) {
  // Convert data to tensors
  const xs = tf.tensor2d(data);
  const ys = tf.tensor2d(labels);

  // Train the model
  const history = await model.fit(xs, ys, {
    epochs: 100,
    batchSize: 32,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`,
        );
      },
    },
  });

  // Clean up tensors
  xs.dispose();
  ys.dispose();

  return history;
}

// Use the model to predict the next best agent
export async function predictNextAgent(
  model: tf.Sequential,
  conversationState: number[],
) {
  // Convert input to tensor
  const input = tf.tensor2d([conversationState]);

  // Make prediction
  const prediction = model.predict(input) as tf.Tensor;

  // Get the index of the highest probability
  const agentIndex = tf.argMax(prediction, 1).dataSync()[0];

  // Clean up tensors
  input.dispose();
  prediction.dispose();

  return agentIndex;
}

// Save the model
export async function saveModel(model: tf.Sequential, modelId: string) {
  await model.save(`indexeddb://${modelId}`);
  return modelId;
}

// Load a saved model
export async function loadModel(modelId: string) {
  return await tf.loadLayersModel(`indexeddb://${modelId}`);
}
