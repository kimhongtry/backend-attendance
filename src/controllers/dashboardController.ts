import { Request, Response } from "express";
import { DashboardService } from "../services/dashboardService";

const dashboardService = new DashboardService();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getStats();
    
    // Always return a success property so the frontend can check it
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};