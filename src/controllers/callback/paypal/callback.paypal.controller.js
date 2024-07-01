import fs from 'fs';

export const paypal_callBack = async (req, res) => {
    console.log('step 1')
    try {
        // Get data from query parameters
        const data = req.query;

        // Convert data to string (for demonstration, you can format this as per your requirement)
        const dataString = JSON.stringify(data, null, 2);

        // Define the file path and name (adjust as per your file system structure)
        const filePath = './callback_data.txt';

        // Write to the file
        fs.writeFile(filePath, dataString, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Error saving data');
            } else {
                console.log('Data saved successfully');
                res.status(200).send('Data saved successfully');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing request');
    }
};
