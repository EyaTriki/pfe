const Conversation = require("../models/Conversation");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const User = require("../models/User");

// Fonction pour générer l'historique initial
const generateInitialHistory = () => {
  return [
    {
      role: "user",
      parts: [
        {
          text: 'You are Healthcare Companion an AI assistant expert in medical health \nYou know about symptoms and signs of various types of illnesses.\nYou can provide expert advice on self diagnosis options in the case where an illness can be treated using a home remedy.\n if a query requires serious medical attention with a doctor, recommend them to book an appointment with a doctor or call the emergency if needed \n If you are asked a question that is not related to medical health respond with "Im sorry but your question is beyond my functionalities".\n do not use external URLs or blogs to refer\nFormat any lists on individual lines with a dash and a space in front of each line.',
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "- I am Healthcare Companion, and I am an AI assistant, well versed in medical matters.\n- I would be delighted to assist you with information on symptoms, signs of different illnesses, and self-diagnosis when applicable.\n- If  the applicable illness can be treated using a home remedy, I will be pleased to guide you through the process.\n- I highly recommend scheduling an appointment with a doctor immediately if a condition requires serious medical attention.\n- Unfortunately, I am unable to assist you with matters outside the realm of medical health.\n- Please feel at ease to ask any questions you may have regarding medical health, and I will be glad to support you.",
        },
      ],
    },
  ];
};

exports.handleMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    const fullname = user.fullname;
    const conversationId = req.params.conversationId; // Obtenez l'ID de la conversation depuis les paramètres de requête, si fourni

    let conversation;

    if (conversationId) {
      // Tenter de récupérer une conversation existante avec l'ID fourni
      conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found or access denied." });
      }
    } else {
      // Créer une nouvelle conversation si aucun ID n'est spécifié ou si la conversation n'existe pas
      conversation = new Conversation({
        userId,
        messages: []
      });
    }


       // Ajouter le nouveau message à la conversation
       conversation.messages.push({
        sender: req.user.fullname, // Utilisez le nom complet de l'utilisateur comme expéditeur
        text: message
      });
  
      // Sauvegarder la conversation mise à jour
      await conversation.save();

    // Process the message with the AI generation model...
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      initialHistory: generateInitialHistory(),
      history: conversation.messages,
      
    });
    const generationConfig = {
      temperature: 1,
      topK: 0,
      topP: 0.95,
      maxOutputTokens: 8192,
    };
    
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    // Démarrer une session de chat avec l'historique actuel de la conversation
    // Créer une fonction pour préparer l'historique complet pour la session de chat
const prepareHistoryForChat = (conversation) => {
  const initialHistoryParts = generateInitialHistory();
  const conversationHistoryParts = conversation.messages.map(msg => ({
    role: msg.sender === req.user.fullname ? "user" : "model",
    parts: [{ text: msg.text }]
  }));
  
  // Combinez l'initialHistory avec l'historique de la conversation
  return initialHistoryParts.concat(conversationHistoryParts);
};

const fullHistory = prepareHistoryForChat(conversation);

const chat = model.startChat({
  generationConfig,
  safetySettings,
  history: fullHistory,
});

    // Envoyer le message à l'IA et obtenir une réponse
    const result = await chat.sendMessage(message);
    const response = result.response.candidates[0].content.parts[0].text;

    // Ajouter la réponse de l'IA à la conversation
    conversation.messages.push({ sender: "AI", text: response });
    await conversation.save();

    // Renvoyer la conversation mise à jour avec la réponse de l'IA
    res.status(200).json({ success: true, conversationId: conversation._id, response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred while processing the request." });
  }
};


exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Conversation.findByIdAndDelete(conversationId);
    res.status(200).json({ success: true, message: "Conversation deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete the conversation."
    });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id; // Assurez-vous que l'ID de l'utilisateur est correctement extrait du token JWT
    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
    const conversationPreviews = conversations.map(convo => ({
      conversationId: convo._id,
      lastMessage: convo.messages.slice(-1)[0]?.text || "No messages"
    }));
    res.status(200).json({ success: true, conversations: conversationPreviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch conversations." });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found." });
    }
    res.status(200).json({ success: true, messages: conversation.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch the conversation." });
  }
};