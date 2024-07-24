const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");
const bcrypt = require("bcrypt");
require('dotenv').config();
const jwt = require("jsonwebtoken");


const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
  };
  
  const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.REFRESH_SECRET);
  };
  
  exports.refresh = async (req, res) => {
    // Prendre le refresh token de l'utilisateur depuis la requête
    const refreshToken = req.body.token;
  
    // Vérifier si aucun token n'est fourni
    if (!refreshToken) {
      return res.status(401).json("You are not authenticated!");
    }
  
    try {
      // Vérifier si le token est valide
      const decodedUser = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  
      // Si le token est valide, générer un nouveau token d'accès
      const newToken = generateAccessToken(decodedUser);
      const newRefreshToken = generateRefreshToken(decodedUser);
  
      // Mettre à jour le refreshToken de l'utilisateur dans la base de données
      const user = await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: newRefreshToken }
      );
  
      // Vérifier si l'utilisateur est trouvé et mettre à jour le refreshToken
      if (!user) {
        return res.status(403).json("Refresh token is not valid!");
      }
  
      // Répondre avec les nouveaux tokens
      res.status(200).json({
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Error while refreshing token:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

exports.userSignIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with the given email!"
            });
        }

        // Vérifiez si l'utilisateur a le rôle d'administrateur
        if (!user.roles.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Not an admin account"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
     
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect!"
            });
        }

        const token = generateAccessToken(user);  // Génère un nouveau accessToken
        const refreshToken = generateRefreshToken(user);  // Génère un nouveau refreshToken

        user.refreshToken = refreshToken; // Met à jour le refreshToken dans l'objet utilisateur
        await user.save(); // Sauvegarde le nouvel état de l'utilisateur dans la base de données

        res.json({
            success: true,
            user: {
                fullname: user.fullname,
                email: user.email,
                roles: user.roles
            },
            token,
            refreshToken
        });

    } catch (error) {
        console.error("Error while signing in:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.createUser = async (req, res) => {
    try {
      const { fullname, email, password } = req.body; // Récupérez les informations de l'utilisateur depuis la requête
  
      // Générez un sel et hash le mot de passe
    
      const hashedPassword = await bcrypt.hash(password,10);
  
      // Création d'un nouvel utilisateur avec le mot de passe hashé
      const newUser = new Patient({
        fullname,
        email,
        password: hashedPassword, // Utilisez le mot de passe hashé ici
        roles:["patient"],
        verified:true,
      });
  
      // Sauvegardez l'utilisateur dans la base de données
      await newUser.save();
      res.status(201).send({ message: 'User created successfully', user: { id: newUser._id, email: newUser.email } });
    } catch (error) {
      res.status(500).send({ message: 'Failed to create user', error: error.message });
    }
  };

exports.modifUser = async (req, res) => {
    const { id, updateData } = req.body; // Assurez-vous que l'ID et les données de mise à jour sont envoyés dans le corps de la requête
    try {
      const updatedUser = await Patient.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedUser) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send({ message: 'User updated successfully', updatedUser });
    } catch (error) {
      res.status(500).send({ message: 'Failed to update user', error: error.message });
    }
  };
  
  exports.deleteUser = async (req, res) => {
    const { id } = req.params; 
    try {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.send({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Failed to delete user', error: error.message });
    }
  };
  
// Controller to handle creation of a doctor
exports.createDoctor = async (req, res) => {
    const { fullname, email, password, specialty } = req.body;
    try {
        // Check if there is already a user with the same email
        const existingUser = await Doctor.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Create a new doctor account
        const newDoctor = new Doctor({
            fullname,
            email,
            password,
            specialty,
            roles: ['doctor']
        });
        await newDoctor.save();
        res.status(201).json({ message: "Doctor created successfully", doctor: newDoctor });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Controller to handle deletion of a doctor
exports.deleteDoctor = async (req, res) => {
    const { doctorId } = req.params;
    try {
        // Delete the doctor by ID
        await Doctor.findByIdAndDelete(doctorId);
        res.status(200).json({ message: "Doctor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Controller to get statistics of doctors by their specialty
exports.getDoctorsBySpecialty = async (req, res) => {
    try {
        // Aggregate doctors by specialty and count each group
        const doctorsBySpecialty = await Doctor.aggregate([
            {
                $group: {
                    _id: "$specialty",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json({ doctorsBySpecialty });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Controller to get the total count of doctors
exports.getDoctorCount = async (req, res) => {
    try {
        // Count all doctor documents
        const doctorCount = await Doctor.countDocuments();
        res.status(200).json({ doctorCount });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAllPatients = async (req, res) => {
    try {
       const allPatients = await Patient.find(); // Assuming `Patient.getAll()` fetches all patients
       res.status(200).json(allPatients); // You could just return the array directly unless you need to wrap it in an object
    } catch (error) {
        console.error("Failed to retrieve patients:", error); // Good practice to log the error
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Controller to get the total count of patients
exports.getPatientCount = async (req, res) => {
    try {
        // Count all patient documents
        const patientCount = await Patient.countDocuments();
        res.status(200).json({ patientCount });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};