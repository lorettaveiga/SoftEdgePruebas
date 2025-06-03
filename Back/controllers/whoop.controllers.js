import axios from 'axios';

export const proxyWhoopRequest = async (req, res) => {
    try {
        const { start, end } = req.query;
        const endpoint = req.path.split('/whoop/')[1];
        
        // Get the access token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        const accessToken = authHeader.split(' ')[1];
        
        // Make the request to WHOOP API
        const response = await axios({
            method: 'GET',
            url: `https://api.prod.whoop.com/developer/v1/${endpoint === 'profile' ? 'user/profile/basic' : endpoint}`,
            params: endpoint !== 'profile' ? { start, end } : undefined,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error proxying WHOOP request:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error fetching data from WHOOP',
            details: error.response?.data || error.message
        });
    }
}; 