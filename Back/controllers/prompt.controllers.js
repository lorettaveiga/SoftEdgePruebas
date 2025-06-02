import { db } from "../utils/firebase.js";

// Controlador para guardar un nuevo prompt
export const savePrompt = async (req, res) => {
  const { userId, prompt } = req.body;

  if (!userId || !prompt) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const newPrompt = {
      userId,
      prompt,
      createdAt: new Date().toISOString(),
    };

    // Guarda el prompt en Firestore
    await db.collection("historial_de_prompts").add(newPrompt);

    res.status(201).json({ message: "Prompt guardado exitosamente", newPrompt });
  } catch (error) {
    console.error("Error al guardar el prompt:", error);
    res.status(500).json({ error: "Error al guardar el prompt" });
  }
};

// Controlador para obtener prompts por usuario
export const getPromptsByUser = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const promptsSnapshot = await db
        .collection("historial_de_prompts")
        .where("userId", "==", userId)
        .get();
  
      const prompts = promptsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      res.status(200).json(prompts);
    } catch (error) {
      console.error("Error al obtener los prompts:", error);
      res.status(500).json({ error: "Error al obtener los prompts" });
    }
  };