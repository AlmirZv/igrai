import { Router } from "express";
import mindarRoutes from "./mindar.routes";

const router = Router();

router.use("/mindar", mindarRoutes);

export default router;
