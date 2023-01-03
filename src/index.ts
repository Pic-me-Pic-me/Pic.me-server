import express, { NextFunction, Request, Response } from "express";
import router from "./router";
const app = express(); 
const PORT = 3000; 

app.use(express.json()); 
app.use("/", router);
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("server running");
});

app.listen(PORT, () => {
  console.log(`
        #############################################
            🛡️ Server listening on port: ${PORT} 🛡️
        #############################################
    `);
}); 