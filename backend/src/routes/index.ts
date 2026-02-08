import { Router } from "express";
import mindarRoutes from "./mindar.routes";

const router = Router();

// Тестовый роут для проверки подключения API роутов
router.get("/test", (req, res) => {
  res.json({ message: "API routes are working!" });
});

router.use("/mindar", mindarRoutes);

export default router;
