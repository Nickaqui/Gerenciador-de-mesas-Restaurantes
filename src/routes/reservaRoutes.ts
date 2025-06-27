import { Router } from "express";
import {
  createReserva,
  getReservas,
  getReservaById,
  updateReserva,
  deleteReserva,
  checkDisponibilidade,
} from "../controllers/reservaController";

const router = Router();

// Rotas CRUD básicas
router.post("/reservas", createReserva);
router.get("/reservas", getReservas);
router.get("/reservas/:id", getReservaById);
router.put("/reservas/:id", updateReserva);
router.delete("/reservas/:id", deleteReserva);

// Rota para verificar disponibilidade
router.get("/disponibilidade", checkDisponibilidade);

export default router;

