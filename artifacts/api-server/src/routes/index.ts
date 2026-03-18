import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import toursRouter from "./tours.js";
import vehiclesRouter from "./vehicles.js";
import transfersRouter from "./transfers.js";
import bookingsRouter from "./bookings.js";
import customRequestsRouter from "./custom-requests.js";
import driversRouter from "./drivers.js";
import invoicesRouter from "./invoices.js";
import currenciesRouter from "./currencies.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/tours", toursRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/transfers", transfersRouter);
router.use("/bookings", bookingsRouter);
router.use("/custom-requests", customRequestsRouter);
router.use("/drivers", driversRouter);
router.use("/invoices", invoicesRouter);
router.use("/currencies", currenciesRouter);

export default router;
