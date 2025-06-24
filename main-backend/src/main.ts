import {connectToDatabase, pool} from "./infrastructure/database/db";
import app from "./infrastructure/web/app";
import 'dotenv/config';
const PORT = process.env.NODE_PORT || 3001;

const startServer = async () => {
    try{
        await connectToDatabase();
        console.log("Connected to the database successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        console.log("Server started successfully.");

    }catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure
    }
};

startServer();