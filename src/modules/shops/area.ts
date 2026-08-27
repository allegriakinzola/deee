import { z } from "zod"

import { KINSHASA_COMMUNES } from "@/lib/kinshasa-communes"

export const shopAreaSchema = z.enum(KINSHASA_COMMUNES)
