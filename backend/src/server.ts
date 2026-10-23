import express, { Router,type Express } from "express";
import cors from 'cors';
import { connectDB } from "./config/dbConnection";

type serverOptions = {
  port: number;
  routes: Router;
};

export class Server {
  private readonly port: number;
  private readonly server: Express;
  private readonly routes: Router;
  constructor(options: serverOptions) {
    this.server = express();
    this.port = options.port;
    this.routes = options.routes;
  }

  public async start () {
    await connectDB();
    this.server.use(cors({origin: process.env.CLIENT_URL || "http://127.0.0.1:5500"}));
    this.server.use(express.json());
    this.server.use("/api", this.routes);
    this.server.listen(this.port, () => {
      console.log(`server running on port: ${this.port}`);
    });
  };
}

