import { Request, Response } from "express";
import Reserva, { IReserva } from "../models/Reserva";

export const createReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const reserva: IReserva = new Reserva(req.body);
    await reserva.save();
    res.status(201).json({ message: "Reserva criada com sucesso!", reserva });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar reserva", error });
  }
};

export const getReservas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nomeCliente, numeroMesa, status } = req.query;
    let query: any = {};
    
    if (nomeCliente) {
      query.nomeCliente = { $regex: nomeCliente as string, $options: "i" };
    }
    if (numeroMesa) {
      query.numeroMesa = parseInt(numeroMesa as string);
    }
    if (status) {
      query.status = status;
    }
    
    const reservas = await Reserva.find(query).sort({ dataHoraReserva: 1 });
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar reservas", error });
  }
};

export const getReservaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findById(id);
    if (!reserva) {
      res.status(404).json({ message: "Reserva não encontrada" });
      return;
    }
    res.status(200).json(reserva);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar reserva", error });
  }
};

export const updateReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByIdAndUpdate(id, req.body, { new: true });
    if (!reserva) {
      res.status(404).json({ message: "Reserva não encontrada" });
      return;
    }
    res.status(200).json({ message: "Reserva atualizada com sucesso!", reserva });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar reserva", error });
  }
};

export const deleteReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByIdAndDelete(id);
    if (!reserva) {
      res.status(404).json({ message: "Reserva não encontrada" });
      return;
    }
    res.status(200).json({ message: "Reserva excluída com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao excluir reserva", error });
  }
};

export const checkDisponibilidade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataHora, numeroMesa } = req.query;
    const dataHoraReserva = new Date(dataHora as string);
    
    // Verificar se há reservas conflitantes
    const reservasConflitantes = await Reserva.find({
      numeroMesa: parseInt(numeroMesa as string),
      dataHoraReserva: {
        $gte: new Date(dataHoraReserva.getTime() - 2 * 60 * 60 * 1000), // 2 horas antes
        $lte: new Date(dataHoraReserva.getTime() + 2 * 60 * 60 * 1000)  // 2 horas depois
      },
      status: { $in: ['reservado', 'ocupado'] }
    });
    
    const disponivel = reservasConflitantes.length === 0;
    res.status(200).json({ 
      disponivel, 
      dataHora: dataHoraReserva,
      numeroMesa: parseInt(numeroMesa as string),
      reservasConflitantes: disponivel ? [] : reservasConflitantes
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar disponibilidade", error });
  }
};

