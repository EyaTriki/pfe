const User = require('../models/User');   // Make sure the path to your User model is correct

// Get all captures of a user
exports.getCaptures = async (req, res) => {
    try {
        const userId = req.user._id;  // Assuming the user's ID is attached to the request via middleware
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        console.log(`Captures retrieved successfully for user ${userId}, count: ${user.captures.length}`);

    
        res.json(user.captures);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a specific capture by ID
exports.getCapture = async (req, res) => {
    try {
        const userId = req.user._id;
        const captureId = req.params.captureId;
        const user = await Patient.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const capture = user.captures.id(captureId);
        if (!capture) return res.status(404).json({ message: 'Capture not found' });
        res.json(capture);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a specific capture by ID
exports.deleteCapture = async (req, res) => {
    try {
        const userId = req.user._id;
        const captureId = req.params.captureId;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if capture exists
        const capture = user.captures.id(captureId);
        if (!capture) return res.status(404).json({ message: 'Capture not found' });

        // Remove the capture from the captures array
        user.captures.pull(captureId);  // This is another way to remove subdocuments
        await user.save();

        res.status(200).json({ message: 'Capture deleted successfully' });
    } catch (error) {
        console.error('Server error', error);
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
};


