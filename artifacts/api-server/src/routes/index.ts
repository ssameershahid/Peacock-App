import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import toursRouter from "./tours.js";
import vehiclesRouter from "./vehicles.js";
import transfersRouter from "./transfers.js";
import bookingsRouter from "./bookings.js";
import customRequestsRouter from "./custom-requests.js";
import driversRouter from "./drivers.js";
import driverFeaturesRouter from "./driver-features.js";
import invoicesRouter from "./invoices.js";
import currenciesRouter from "./currencies.js";
import adminRouter from "./admin.js";
import accountRouter from "./account.js";
import savedTripsRouter from "./saved-trips.js";
import tripLeadsRouter from "./trip-leads.js";
import cyoPricingRouter from "./cyo-pricing.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/tours", toursRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/transfers", transfersRouter);
router.use("/bookings", bookingsRouter);
router.use("/custom-requests", customRequestsRouter);
router.use("/drivers", driversRouter);
router.use("/drivers", driverFeaturesRouter);
router.use("/invoices", invoicesRouter);
router.use("/currencies", currenciesRouter);
router.use("/admin", adminRouter);
router.use("/account", accountRouter);
router.use("/saved-trips", savedTripsRouter);
router.use("/trip-leads", tripLeadsRouter);
router.use("/cyo-pricing", cyoPricingRouter);

export default router;
